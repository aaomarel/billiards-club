const reportWebVitals = async (onPerfEntry?: any) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    const webVitals = await import('web-vitals');
    webVitals.getCLS(onPerfEntry);
    webVitals.getFID(onPerfEntry);
    webVitals.getFCP(onPerfEntry);
    webVitals.getLCP(onPerfEntry);
    webVitals.getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;