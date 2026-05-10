"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { Watercolor } from "./Watercolor";

const GROW_RATE = 0.065;
const SEG_H = 0.03;
const BRANCH_CHANCE = 0.25;
const MAX_DEPTH = 2;
const MAX_BR_SEGS = 14;
const MAIN_UP = 0.06;
const BR_UP = 0.08;
const DIR_RND = 2.5;
const FADE_AGE = 7;
const FADE_DUR = 4;
const W = 1800;
const L = 1000;
const R = 80;
const LEAF_FADE_AGE = 6;
const BG = "#9ab06f";

function fd(age: number) {
  if (age < FADE_AGE) return 1;
  const t = (age - FADE_AGE) / FADE_DUR;
  return t >= 1 ? 0 : 1 - t;
}

interface S { x: number; y: number; z: number; dx: number; dy: number; dz: number; age: number }
interface B { segs: S[]; dx: number; dy: number; dz: number; growing: boolean; depth: number }
interface Lf { x: number; y: number; z: number; spin: number; sz: number; age: number }
interface Rs { x: number; y: number; z: number; dx: number; dy: number; dz: number; age: number }

function dev(dx: number, dy: number, dz: number, up: number): [number, number, number] {
  const s = Math.random() < 0.5 ? -1 : 1;
  const a = s * Math.random() / DIR_RND;
  const c = Math.cos(a), sn = Math.sin(a);
  const px = -dz, pz = dx;
  const pl = Math.sqrt(px * px + pz * pz) || 1;
  let nx = dx * c + (pz / pl) * sn * dy;
  let ny = dy * c + up;
  let nz = dz * c - (px / pl) * sn * dy;
  const l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  return [nx / l, ny / l, nz / l];
}

// nothing here — using inline random walk below

function Scene({ isMobile }: { isMobile: boolean }) {
  const growRate = isMobile ? 0.09 : GROW_RATE;
  const frameCount = useRef(-1);
  const stem = useRef<S[]>([{ x: 0, y: 0, z: 0, dx: 0, dy: 1, dz: 0, age: 0 }]);
  const sDir = useRef<[number, number, number]>([0, 1, 0]);
  const wanderX = useRef(0);
  const wanderZ = useRef(0);
  const stepCount = useRef(0);
  const brs = useRef<B[]>([]);
  const lvs = useRef<Lf[]>([]);
  const rss = useRef<Rs[]>([]);
  const tmr = useRef(0);
  const ct = useRef(new THREE.Vector3(0, 0, 0));
  const ov = useRef(0);

  // Geometries
  // Equal radii + openEnded = seamless connections between segments
  const wGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.01, 0.01, 1, 6, 1, true); g.translate(0, 0.5, 0); return g; }, []);
  const lGeo = useMemo(() => {
    const sh = new THREE.Shape();
    // Thin petiole (stem) from origin to leaf base
    sh.moveTo(-0.012, 0);
    sh.lineTo(-0.012, 0.2);
    // Leaf blade starts at the top of the petiole
    sh.bezierCurveTo(-0.18, 0.22, -0.22, 0.38, -0.18, 0.52);
    sh.bezierCurveTo(-0.12, 0.64, -0.04, 0.72, 0, 0.75);
    sh.bezierCurveTo(0.04, 0.72, 0.12, 0.64, 0.18, 0.52);
    sh.bezierCurveTo(0.22, 0.38, 0.18, 0.22, 0.012, 0.2);
    // Back down the petiole
    sh.lineTo(0.012, 0);
    sh.lineTo(-0.012, 0);
    return new THREE.ShapeGeometry(sh, 6);
  }, []);
  // Load low-poly rose GLB — only use the red petal mesh (first child)
  const roseGltf = useGLTF("/rose-lowpoly.glb");
  const rGeo = useMemo(() => {
    let geo: THREE.BufferGeometry | null = null;
    roseGltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !geo) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat && mat.color && mat.color.r > 0.5) {
          const g = child.geometry.clone();
          g.translate(0, -8.2, 0);
          g.scale(0.035, 0.035, 0.035);
          geo = g;
        }
      }
    });
    if (!geo) {
      roseGltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && !geo) {
          const g = child.geometry.clone();
          g.translate(0, -8.2, 0);
          g.scale(0.035, 0.035, 0.035);
          geo = g;
        }
      });
    }
    return geo!;
  }, [roseGltf]);

  const wMat = useMemo(() => new THREE.MeshBasicMaterial({ color: 0x3a2a18, side: THREE.DoubleSide }), []);
  const lMat = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: false, color: 0x1a4a12, side: THREE.DoubleSide }), []);
  const rMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xcc1133, roughness: 0.5, side: THREE.DoubleSide }), []);

  const wRef = useRef<THREE.InstancedMesh>(null);
  const lRef = useRef<THREE.InstancedMesh>(null);
  const rRef = useRef<THREE.InstancedMesh>(null);
  const dm = useMemo(() => new THREE.Object3D(), []);
  const _u = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const _d = useMemo(() => new THREE.Vector3(), []);
  const _xA = useMemo(() => new THREE.Vector3(), []);
  const _zA = useMemo(() => new THREE.Vector3(), []);
  const _rotMat = useMemo(() => new THREE.Matrix4(), []);

  function getPerp(dx: number, dy: number, dz: number): [number, number] {
    // Get a perpendicular XZ direction to the stem
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len > 0.1) return [-dz / len, dx / len];
    // Stem is nearly vertical — pick random perpendicular
    const a = Math.random() * Math.PI * 2;
    return [Math.cos(a), Math.sin(a)];
  }

  function addLeaves(x: number, y: number, z: number) {
    if (lvs.current.length >= L - 2) return;
    const spin = Math.PI * Math.random();
    lvs.current.push({ x, y, z, spin, sz: 0.07 + Math.random() * 0.1, age: 0 });
    lvs.current.push({ x, y, z, spin: spin + Math.PI, sz: 0.07 + Math.random() * 0.1, age: 0 });
  }

  function growBr(br: B) {
    if (!br.growing) return;
    const ls = br.segs[br.segs.length - 1];
    const [nx, ny, nz] = dev(br.dx, br.dy, br.dz, BR_UP);
    br.dx = nx; br.dy = ny; br.dz = nz;
    const px = ls.x + nx * SEG_H * 0.85;
    const py = ls.y + ny * SEG_H * 0.85;
    const pz = ls.z + nz * SEG_H * 0.85;
    br.segs.push({ x: px, y: py, z: pz, dx: nx, dy: ny, dz: nz, age: 0 });
    if (br.segs.length % 4 === 0) addLeaves(px, py, pz);

    // Sub-branch
    if (br.depth < MAX_DEPTH && br.segs.length > 3 && Math.random() < BRANCH_CHANCE * 0.3 && brs.current.length < 60) {
      const [spx, spz] = getPerp(nx, ny, nz);
      const sd = Math.random() < 0.5 ? -1 : 1;
      const spr = 0.5 + Math.random() * 0.4;
      const sdx = spx * sd * spr;
      const sdy = 0.2 + Math.random() * 0.2;
      const sdz = spz * sd * spr;
      const sl = Math.sqrt(sdx * sdx + sdy * sdy + sdz * sdz) || 1;
      brs.current.push({
        segs: [{ x: px, y: py, z: pz, dx: sdx / sl, dy: sdy / sl, dz: sdz / sl, age: 0 }],
        dx: sdx / sl, dy: sdy / sl, dz: sdz / sl, growing: true, depth: br.depth + 1,
      });
      addLeaves(px, py, pz);
    }

    if (br.segs.length >= MAX_BR_SEGS) {
      br.growing = false;
      if (Math.random() < 0.4 && rss.current.length < R) {
        rss.current.push({ x: px, y: py, z: pz, dx: nx, dy: ny, dz: nz, age: 0 });
      }
    }
  }

  useFrame(({ camera }, delta) => {
    frameCount.current++;

    // Age
    for (const s of stem.current) s.age += delta;
    for (const b of brs.current) for (const s of b.segs) s.age += delta;
    for (const l of lvs.current) l.age += delta;
    for (const r of rss.current) r.age += delta;

    // Prune
    stem.current = stem.current.filter(s => fd(s.age) > 0);
    for (const b of brs.current) b.segs = b.segs.filter(s => fd(s.age) > 0);
    brs.current = brs.current.filter(b => b.segs.length > 0);
    lvs.current = lvs.current.filter(l => { const t = (l.age - LEAF_FADE_AGE) / FADE_DUR; return t < 1; });
    rss.current = rss.current.filter(r => fd(r.age) > 0);

    if (stem.current.length === 0) {
      stem.current.push({ x: 0, y: ct.current.y - 2, z: 0, dx: 0, dy: 1, dz: 0, age: 0 });
      sDir.current = [0, 1, 0];
    }

    // Grow
    tmr.current += delta;
    let grew = false;
    if (tmr.current >= growRate) {
      grew = true;
      tmr.current = 0;
      stepCount.current++;
      const ls = stem.current[stem.current.length - 1];

      // Stronger horizontal wander for a bushier, more organic shape
      wanderX.current += (Math.random() - 0.5) * 0.05;
      wanderZ.current += (Math.random() - 0.5) * 0.05;
      wanderX.current *= 0.92;
      wanderZ.current *= 0.92;
      const [bx, by, bz] = sDir.current;
      const nx = bx + wanderX.current;
      const ny = by + MAIN_UP;
      const nz = bz + wanderZ.current;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      sDir.current = [nx / nl, ny / nl, nz / nl];
      const px = ls.x + nx * SEG_H, py = ls.y + ny * SEG_H, pz = ls.z + nz * SEG_H;
      stem.current.push({ x: px, y: py, z: pz, dx: nx, dy: ny, dz: nz, age: 0 });

      // Leaves only every 3rd segment on main stem (not every segment)
      if (stepCount.current % 3 === 0) addLeaves(px, py, pz);

      if (stem.current.length > 4 && Math.random() < BRANCH_CHANCE) {
        // Branch sideways using a perpendicular direction
        const [bpx, bpz] = getPerp(nx, ny, nz);
        const sd = Math.random() < 0.5 ? -1 : 1;
        const spread = 0.6 + Math.random() * 0.4;
        const bdx = bpx * sd * spread;
        const bdy = 0.2 + Math.random() * 0.2;
        const bdz = bpz * sd * spread;
        const bl = Math.sqrt(bdx * bdx + bdy * bdy + bdz * bdz) || 1;
        brs.current.push({
          segs: [{ x: px, y: py, z: pz, dx: bdx / bl, dy: bdy / bl, dz: bdz / bl, age: 0 }],
          dx: bdx / bl, dy: bdy / bl, dz: bdz / bl, growing: true, depth: 1,
        });
      }

      for (const br of brs.current) if (br.growing) growBr(br);
    }

    // === RENDER (skip matrix rebuilds on idle frames) ===
    if (!isMobile || grew || frameCount.current % 3 === 0) {
    const w = wRef.current;
    if (w) {
      let c = 0;
      const GROW_IN = growRate;

      // Main stem
      const stemLen = stem.current.length;
      for (let i = 0; i < stemLen; i++) {
        if (c >= W) break;
        const s = stem.current[i];
        const f = fd(s.age); if (f <= 0) continue;
        // Smooth grow-in: new segments extend from 0 to full height
        const growIn = Math.min(1, s.age / GROW_IN);
        // Gradual taper along stem length
        const taper = 0.6 + 0.5 * (1 - i / Math.max(stemLen, 1));
        const distFromTip = stemLen - 1 - i;
        const tipTaper = distFromTip < 3 ? 0.2 + 0.8 * (distFromTip / 3) : 1.0;
        const thick = taper * tipTaper * f;
        _d.set(s.dx, s.dy, s.dz).normalize();
        dm.position.set(s.x, s.y, s.z);
        dm.quaternion.setFromUnitVectors(_u, _d);
        dm.scale.set(thick, SEG_H * growIn, thick);
        dm.updateMatrix();
        w.setMatrixAt(c++, dm.matrix);
      }
      // Virtual tip: smoothly extends between growth ticks so the tip never stops moving
      if (c < W && stemLen > 0) {
        const tipSeg = stem.current[stemLen - 1];
        const tipProgress = tmr.current / growRate;
        if (tipProgress > 0.02) {
          const lastGrowIn = Math.min(1, tipSeg.age / GROW_IN);
          const [sdx, sdy, sdz] = sDir.current;
          _d.set(sdx, sdy, sdz).normalize();
          dm.position.set(
            tipSeg.x + tipSeg.dx * SEG_H * lastGrowIn,
            tipSeg.y + tipSeg.dy * SEG_H * lastGrowIn,
            tipSeg.z + tipSeg.dz * SEG_H * lastGrowIn
          );
          dm.quaternion.setFromUnitVectors(_u, _d);
          dm.scale.set(0.1, SEG_H * tipProgress, 0.1);
          dm.updateMatrix();
          w.setMatrixAt(c++, dm.matrix);
        }
      }
      // Branches
      for (const br of brs.current) {
        const brLen = br.segs.length;
        for (let i = 0; i < brLen; i++) {
          if (c >= W) break;
          const s = br.segs[i];
          const f = fd(s.age); if (f <= 0) continue;
          const growIn = Math.min(1, s.age / GROW_IN);
          // Taper from base to tip
          const taper = 0.5 * (1 - i / Math.max(brLen, 1)) + 0.08;
          const distFromTip = brLen - 1 - i;
          const tipTaper = distFromTip < 3 ? 0.15 + 0.85 * (distFromTip / 3) : 1.0;
          const thick = taper * tipTaper * f;
          _d.set(s.dx, s.dy, s.dz).normalize();
          dm.position.set(s.x, s.y, s.z);
          dm.quaternion.setFromUnitVectors(_u, _d);
          dm.scale.set(thick, SEG_H * 0.85 * growIn, thick);
          dm.updateMatrix();
          w.setMatrixAt(c++, dm.matrix);
        }
      }
      w.count = c;
      w.instanceMatrix.needsUpdate = true;
    }

    const lf = lRef.current;
    if (lf) {
      let c = 0;
      for (const l of lvs.current) {
        if (c >= L) break;
        const gr = Math.min(1, l.age * 0.4);
        const lf2 = l.age < LEAF_FADE_AGE ? 1 : Math.max(0, 1 - (l.age - LEAF_FADE_AGE) / FADE_DUR);
        const s = l.sz * gr * lf2;
        if (s < 0.002) continue;
        dm.position.set(l.x, l.y, l.z);
        // Philip's approach: lay flat (face up), random spin
        dm.rotation.set(-Math.PI / 2, 0, l.spin);
        dm.scale.setScalar(s);
        dm.updateMatrix();
        lf.setMatrixAt(c++, dm.matrix);
      }
      lf.count = c;
      lf.instanceMatrix.needsUpdate = true;
    }

    const rs = rRef.current;
    if (rs) {
      let c = 0;
      for (const r of rss.current) {
        if (c >= R) break;
        const gr = Math.min(1, r.age * 0.25);
        const s = 0.8 * gr * fd(r.age);
        if (s < 0.002) continue;
        // Position rose at stem tip, oriented along branch direction
        _d.set(r.dx, r.dy, r.dz).normalize();
        dm.position.set(r.x, r.y, r.z);
        // Philip's approach: flower faces back toward parent branch point
        _d.set(r.x - r.dx * 0.3, r.y - r.dy * 0.3, r.z - r.dz * 0.3);
        dm.lookAt(_d);
        dm.scale.setScalar(s);
        dm.updateMatrix();
        rs.setMatrixAt(c++, dm.matrix);
      }
      rs.count = c;
      rs.instanceMatrix.needsUpdate = true;
    }
    } // end matrix update throttle

    // Camera (Philip's approach: fixed high position, vine grows into view)
    const top = stem.current[stem.current.length - 1];
    if (top) { _d.set(top.x, top.y, top.z); ct.current.lerp(_d, 0.04); }

    ov.current += 0.002;
    const camR = 1.4;
    const orbX = -Math.cos(ov.current) * camR + ct.current.x;
    const orbZ = Math.sin(ov.current) * camR + ct.current.z;
    const tipY = ct.current.y;
    const goalY = tipY > 1 ? tipY + 1.2 : 2.2;

    // Smooth motion (Philip's factor=2 interpolation)
    camera.position.x = (camera.position.x * 2 + orbX) / 3;
    camera.position.y = (camera.position.y * 2 + goalY) / 3;
    camera.position.z = (camera.position.z * 2 + orbZ) / 3;
    camera.lookAt(ct.current);
  });

  return (
    <>
      <color attach="background" args={["#8b2a4a"]} />
      <fog attach="fog" args={["#8b2a4a", 2, 5]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 8, 4]} intensity={0.4} />
      <instancedMesh ref={wRef} args={[wGeo, wMat, W]} frustumCulled={false} />
      <instancedMesh ref={lRef} args={[lGeo, lMat, L]} frustumCulled={false} />
      <instancedMesh ref={rRef} args={[rGeo, rMat, R]} frustumCulled={false} />

      <EffectComposer>
        <Watercolor kernelSize={8} />
      </EffectComposer>
    </>
  );
}

export default function GrowingRose() {
  const [ok, setOk] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setOk(true);
  }, []);
  if (!ok) return <div className="absolute inset-0" />;
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 2.2, 1.4], fov: 50 }} dpr={isMobile ? 1 : [1, 1.5]}>
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
