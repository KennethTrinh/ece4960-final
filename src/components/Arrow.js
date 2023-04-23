
const Arrow = ({ height, arrowhead = '#arrow', dasharray = '0 0' }) => (
  <>
    <svg width="0" height="0">
      <defs>
        <marker
          id="arrow"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 12 12"
          refX="6"
          refY="6"
          orient="auto"
        >
          <path
            d="M2,2 L10,6 L2,10 L6,6 L2,2"
            style={{ fill: 'grey' }}
          ></path>
        </marker>
      </defs>

      <defs>
        <marker
          id="circle"
          markerUnits="strokeWidth"
          markerWidth="10"
          markerHeight="10"
          viewBox="0 0 12 12"
          refX="6"
          refY="6"
          orient="auto"
        >
          <circle r="3" cx="3" cy="6" style={{ fill: 'grey' }}></circle>
        </marker>
      </defs>
    </svg>

    <div
      style={{
        position: 'relative',
        left: '1px',
        top: '5px',
        width: '15px',
        height: `${height}px`,
        backgroundColor: 'none',
        borderRadius: '5px',
        opacity: '0.8',
        pointerEvents: 'None',
      }}
    >
      <svg>
        <line
          x1="8"
          y1="0"
          x2="8"
          y2={`${height - 5}`}
          stroke="grey"
          strokeWidth="1.5"
          markerEnd={`url(${arrowhead})`}
          strokeDasharray={dasharray}
        />
      </svg>
    </div>
  </>
);

export default Arrow;
