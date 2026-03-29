/**
 * components/effects/MeshBackground.tsx
 * Animated gradient mesh background — three floating orbs that drift slowly.
 * Uses CSS classes defined in globals.css. Pure CSS animation, no JS.
 * Renders as fixed position behind all content.
 */

export default function MeshBackground() {
  return (
    <div className="mesh-bg" aria-hidden="true">
      <div className="mesh-orb mesh-orb-1" />
      <div className="mesh-orb mesh-orb-2" />
      <div className="mesh-orb mesh-orb-3" />
    </div>
  );
}
