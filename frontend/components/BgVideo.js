"use client";
import CosmicParticles from "@/components/CosmicParticles";

// Fixed cosmic background: the "Where Power Speaks" scene. The real moon from
// the artwork sits in its orbit and slowly rotates in place (its look is kept
// exactly as in the image). Particles drift on top.
export default function BgVideo() {
  return (
    <div className="site-bgvideo" aria-hidden="true">
      <div
        className="rest-image"
        style={{ backgroundImage: "url('/images/cosmic-bg.jpg')" }}
      />
      <div className="rest-dark" />

      <div className="spin-planet">
        <div className="moon-img" />
      </div>

      <CosmicParticles />
    </div>
  );
}
