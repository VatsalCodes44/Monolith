import React from "react";
import Svg, { Path, Circle, SvgProps } from "react-native-svg";

export const BQ: React.FC<SvgProps> = (props) => {
  return (
    <Svg viewBox="0 0 81 81" {...props}>
      <Path d="M0 0h81v81H0z" fill="none" />

      <Path
        d="m55.7 50.9 4-34.9-19.2 33.2L21.3 16l4.1 34.9L7.9 30.8 18.8 72h43.4l10.9-41.2-17.4 20.1zm-15.2 16-3.6-6.4 3.6-6.4 3.6 6.4-3.6 6.4z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />

      <Path
        d="m40.5 11.7-5.6 23.5 5.6 9.5 5.6-9.5z"
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />

      <Circle 
        cx="40.5" 
        cy="10.6" 
        r="5.4" 
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M41.6 7.2c-.8-.4-1.7-.6-2.6-.3-1.8.5-2.9 2.4-2.4 4.2 0 .1 0 .1.1.2 2.9.3 5.3-2.8 4.9-4.1z"
        fill="#6d6e6e"
      />

      <Circle 
        cx="59.5" 
        cy="16" 
        r="5.4" 
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M60.6 12.6c-.8-.4-1.7-.6-2.6-.3-1.8.5-2.9 2.4-2.4 4.2 0 .1 0 .1.1.2 2.9.2 5.3-2.8 4.9-4.1z"
        fill="#6d6e6e"
      />

      <Circle 
        cx="21.5" 
        cy="16" 
        r="5.4" 
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M22.6 12.6c-.8-.4-1.7-.6-2.6-.3-1.8.5-2.9 2.4-2.4 4.2 0 .1 0 .1.1.2 2.9.2 5.3-2.8 4.9-4.1z"
        fill="#6d6e6e"
      />

      <Circle 
        cx="73.1" 
        cy="31.4" 
        r="5.4" 
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M74.2 28c-.8-.4-1.7-.6-2.6-.3-1.8.5-2.9 2.4-2.4 4.2 0 .1 0 .1.1.2 2.9.2 5.3-2.8 4.9-4.1z"
        fill="#6d6e6e"
      />

      <Circle 
        cx="7.9" 
        cy="31.4" 
        r="5.4" 
        fill={props.fill || "#010101"}
        stroke="#fff"
        strokeWidth="1"
      />
      <Path
        d="M9 28c-.8-.4-1.7-.6-2.6-.3-1.8.4-2.9 2.3-2.4 4.1 0 .1 0 .1.1.2 2.9.3 5.3-2.7 4.9-4zm31.5-7.1-3.1 13.4 3.1 5.3zm16.1 33.8 1.8 5.6 9.6-22zm-8.7-4.2 8-21.2-12.3 20.8zm-14.6 0L25 29.1 28.1 51zm-10.2 8.2L12.6 40.9l7.9 26.4z"
        fill="#6d6e6e"
      />
    </Svg>
  );
};