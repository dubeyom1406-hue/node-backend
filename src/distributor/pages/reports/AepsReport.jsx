import React from 'react';
import ReportTable from './ReportTable';

const AepsReport = () => (
    <ReportTable title="AEPS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Retailer', key: 'r' }, { label: 'Bank', key: 'b' }, { label: 'Amt', key: 'a' }, { label: 'Status', key: 's' }]} data={[]} />
);

export default AepsReport;
