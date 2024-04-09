<template>
  <svg viewBox="0 0 100 100" class="spin-loader" stroke="currentColor">
    <circle class="spin" cx="50" cy="50" r="40"/>
    <circle cx="50" cy="50" r="20" fill="currentColor" opacity="0.40"/>
  </svg>
</template>

<style type="text/css" scoped>
svg.spin-loader {
  animation: 2s linear infinite svg-animation;
  max-width: 100px;
}

@keyframes svg-animation {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}

svg.spin-loader circle.spin {
  animation: 1.4s ease-in-out infinite both spin-animation;
  display: block;
  fill: transparent;
  stroke-linecap: round;
  stroke-dasharray: 283;
  stroke-dashoffset: 280;
  stroke-width: 14px;
  transform-origin: 50% 50%;
}

@keyframes spin-animation {
  0%,
  25% {
    stroke-dashoffset: 280;
    transform: rotate(0);
  }

  50%,
  75% {
    stroke-dashoffset: 75;
    transform: rotate(45deg);
  }

  100% {
    stroke-dashoffset: 280;
    transform: rotate(360deg);
  }
}
</style>
