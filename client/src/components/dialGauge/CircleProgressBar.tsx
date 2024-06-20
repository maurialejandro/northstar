import React from 'react';

interface CircleProgressBarProps {
  percentage: number;
  circleWidth: number;
  version: string;
  averageRate?: number;
}

const CircleProgressBar: React.FC<CircleProgressBarProps> = ({percentage, averageRate, circleWidth, version}) => {
    const radius = circleWidth / 2.2 - 15;
    const dashArray = radius * Math.PI * 2;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    const averageCircleRadius = radius + 16;
    const dashArrayAverage = averageCircleRadius * Math.PI * 2;

    if (!averageRate) {
        averageRate = 0;
    }

    const averageRateDegrees = (averageRate / 100) * 360;

    const versionColor = () => {
        switch (version) {
            case "blue":
                return "#01c2ff4f";
            case "red":
                return "#ff007b4f";
        }
    }

    return (
        <div>
            <svg
                width={circleWidth}
                height={circleWidth}
                viewBox={`0 0 ${circleWidth} ${circleWidth}`}
            >

                <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth="15px"
                    r={radius}
                    className="circle-glow"
                    stroke="rgba(255,255,255,0.3)"
                    fill={"transparent"}
                />

                <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth="15px"
                    r={radius}
                    className="circle-background"
                    stroke="white"
                    fill={"transparent"}
                />

                <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth="15px"
                    r={radius}
                    className="circle-progress"
                    style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                    }}
                    transform={`rotate(-90 ${circleWidth / 2} ${circleWidth / 2})`}
                    stroke={versionColor()}
                    fill={"transparent"}
                />

              {
                version === "red" &&
                  <circle
                    cx={circleWidth / 2}
                    cy={circleWidth / 2}
                    strokeWidth="15px"
                    r={averageCircleRadius}
                    className="circle-average"
                    style={{
                        strokeDasharray: dashArrayAverage,
                        strokeDashoffset: 516,
                    }}
                    transform={`rotate(${-90 + averageRateDegrees} ${circleWidth / 2} ${circleWidth / 2})`}
                    stroke={'#fff'}
                    fill={"transparent"}
                />
              }

                <text
                  x="50%"
                  y="50%"
                  dy="0.3em"
                  textAnchor="middle"
                  className="circle-text"
                  fill="white"
                  fontSize={"24px"}
                  fontWeight={400}
                >
                    {percentage}%
                </text>
            </svg>
        </div>
    );
};

export default CircleProgressBar;
