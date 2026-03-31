import React from 'react';
import ReportTable from './ReportTable';

const CmsReport = () => (
    <ReportTable title="CMS Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Biller', key: 'b' }, { label: 'Ref', key: 'r' }, { label: 'Amt', key: 'a' }]} data={[]} />
);

export default CmsReport;
