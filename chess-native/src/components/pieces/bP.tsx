import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export const BP: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 81 81" {...props}>
      <Path d="M0 0h81v81H0z" fill="none" />
      <Path
        d="M40.5 12.5c-6 0-10.7 4.8-10.7 10.7 0 3.6 1.8 6.9 4.6 8.8h12.3c2.8-1.9 4.6-5.2 4.6-8.8-.1-6-4.8-10.7-10.8-10.7"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />
      <Path
        d="M43.2 16.4c-1.5-.9-3.3-1.1-5.2-.6-3.6 1-5.6 4.6-4.7 8.2 0 .1.1.2.1.3 5.8.7 10.6-5.2 9.8-7.9z"
        fill="#6d6e6e"
      />
      <Path
        d="m34.5 31.7-.3 7.7-3.5 21.7L18.3 72h44.3L50.3 61.1 46 39.4l-.3-7.7"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />
      <Path
        d="m37.7 39.6-3.9 22.5-6.6 7.1h7.6l5.2-5.4.1-24.2z"
        fill="#6d6e6e"
      />
      <Path
        d="M26.6 38.8h27.8l-6.7-8H33.3z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />
      <Path
        d="M32.3 36.5h8.8l-2.1-4h-3.8z"
        fill="#6d6e6e"
      />
    </Svg>
  );
};