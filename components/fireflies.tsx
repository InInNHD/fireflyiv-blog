const POSITIONS = [
  { left: "12%", top: "28%", delay: "0s", dur: "11s" },
  { left: "78%", top: "18%", delay: "1.2s", dur: "13s" },
  { left: "64%", top: "72%", delay: "2.4s", dur: "10s" },
  { left: "28%", top: "80%", delay: "0.6s", dur: "12s" },
  { left: "88%", top: "58%", delay: "3.1s", dur: "14s" },
  { left: "42%", top: "12%", delay: "1.8s", dur: "9s" },
];

export default function Fireflies() {
  return (
    <>
      {POSITIONS.map((p, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </>
  );
}
