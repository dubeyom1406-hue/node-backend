import React from 'react';
import ReportTable from './ReportTable';

const BbpsReport = () => (
    <ReportTable title="BBPS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Category', key: 'c' }, { label: 'Biller', key: 'b' }, { label: 'Amt', key: 'a' }]} data={[]} />
);

export default BbpsReport;
