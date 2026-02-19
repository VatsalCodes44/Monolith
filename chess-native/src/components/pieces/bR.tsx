import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

export const BR: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 81 81" {...props}>
      <Path d="M0 0h81v81H0z" fill="none" />

      <Path
        d="M56.9 31.1H24.1L19.2 72h42.6z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />

      <Path
        d="M14.2 58.5h52.5V72H14.2z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />

      <Path
        d="M41.1 34.1c-.1 7.2-6.6 24.4-14.2 24.4h-2.3l3.8-24.4h12.7zM18.4 62.3h17.9v6.1H18.4z"
        fill="#6d6e6e"
      />

      <Path
        d="M53.4 12v6.9h-6.9V12h-12v6.9h-6.9V12h-12v11.4l9 9.1h31.8l9-9.1V12z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="2"
      />

      <Path
        d="M62.4 15h-6v7.2zm-18.9 0h-6v7.2zm-18.9 0h-6v7.2z"
        fill="#6d6e6e"
      />
    </Svg>
  );
};