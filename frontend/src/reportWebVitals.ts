import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

type ReportHandler = (metric: {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
    onINP && onINP(onPerfEntry);  // Check if onINP is available
  }
};

export default reportWebVitals;
 