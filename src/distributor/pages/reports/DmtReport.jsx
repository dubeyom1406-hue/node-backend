import React from 'react';
import ReportTable from './ReportTable';

const DmtReport = () => (
    <ReportTable title="DMT Transaction Report" columns={[{ label: 'Time', key: 't' }, { label: 'Sender', key: 's' }, { label: 'Receiver', key: 'r' }, { label: 'Amt', key: 'a' }, { label: 'Status', key: 's' }]} data={[]} />
);

export default DmtReport;
