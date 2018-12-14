interface IPerfData {
  resources: PerformanceEntry[];
  marks: PerformanceEntry[];
  measures: PerformanceEntry[];
  perfTiming: PerformanceTiming | null;
  navigationTiming: PerformanceEntry | null;
  allResourcesCalc: any[];
}

const data: IPerfData = {
  resources: [],
  marks: [],
  measures: [],
  perfTiming: null,
  navigationTiming: null,
  allResourcesCalc: []
};

if (window.performance && window.performance.getEntriesByType !== undefined) {
  data.resources = window.performance.getEntriesByType('resources');
  data.marks = window.performance.getEntriesByType('mark');
  data.measures = window.performance.getEntriesByType('measure');
} else {
  // does not support Resource Timing API
  // stop collet performance data
}

if (PerformanceNavigationTiming) {
  const navigationEntry = window.performance.getEntriesByType('navigation');
  if (navigationEntry && navigationEntry.length)
  data.navigationTiming = navigationEntry[0];
}

// if PerformanceNavigationTiming is not existing, use timing api
if (!PerformanceNavigationTiming && window.performance.timing) {
  data.perfTiming = window.performance.timing;
}

export default data;