const Tooltip: React.FC<{
  content: React.ReactNode | string;
  position: { x: number; y: number };
}> = ({ content, position }) => {
  return (
    <div
      id="tooltip"
      className="tooltip"
      style={{
        left: position.x - 450 + "px",
        top: position.y - 200 + "px",
      }}
    >
      {content}
    </div>
  );
};

export default Tooltip;
