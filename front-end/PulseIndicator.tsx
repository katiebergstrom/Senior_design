// the code on this page handles calculating the rate of glucose change for the arrow 
import React, { useState, useEffect } from "react";
import {
  Canvas,
  useImage,
  Image,
  Group
} from "@shopify/react-native-skia";
import { View } from 'react-native';

// Arrow image
export const GlucoseArrow = (Data: any) => {
  const arrow = useImage(require("./images/right-arrow.png"));

  // Map glucose value to an angle for arrow rotation
  let angle = 0;
  if (Data.glucoseHistory.length == 0 || Data.glucoseHistory.length == 1){
    return <View />;
  }
  // take last two glucose readings and compute change in rate
  const Rate1 = Data.glucoseHistory[Data.glucoseHistory.length-2];
  const Rate2 = Data.glucoseHistory[Data.glucoseHistory.length-1];;
  const Rate = Rate2.y-Rate1.y;
  //const Rate = 20;
  // Based on Rate change, display different degree arrows
  if (Rate < -10) {
    angle = 85; // Dropping fast glucose, point down
  } else if (-10 <= Rate && Rate < -5) {
    angle = 30; // Dropping slow glucose, point slightly down
  } else if (-5 <= Rate && Rate < 5) {
    angle = 0; // Normal glucose, point right
  } else if (5 <= Rate && Rate < 10) {
    angle = -35; // Rising slow glucose, point slightly up
  } else if (Rate >= 10) {
    angle = -85; // Rising fast glucose, point up
  }

  // If the image isn't loaded, return a fallback
  if (!arrow) {
    return <View />;
  }

  return (
    <Canvas style={{ height: 250, width: 300 }}>
      <Group origin={{ x: 150, y: 150 }}transform={[{ rotate: (angle * (Math.PI / 180)) }]}>
        
        {/* Arrow Image with rotation based on glucose rate */}
        <Image
          image={arrow}
          fit="contain"
          x={125}
          y={125}
          width={50}
          height={50}
      />
      </Group>
    </Canvas>
  );
};
