import React from 'react';
import ReportTable from './ReportTable';

const ChargeReport = () => (
    <ReportTable title="Charges & Deductions" columns={[{ label: 'Date', key: 'd' }, { label: 'Description', key: 'desc' }, { label: 'Amount', key: 'a' }]} data={[]} />
);

export default ChargeReport;
