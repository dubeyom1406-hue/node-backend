import React from 'react';
import ReportTable from './ReportTable';

const PurchaseReport = () => (
    <ReportTable
        title="Purchase (Fund) Report"
        columns={[
            { label: 'Date', key: 'date' },
            { label: 'Type', key: 'type' },
            { label: 'UTR/Ref', key: 'ref' },
            { label: 'Amount', key: 'amt', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Admin Note', key: 'note' }
        ]}
        data={[
            { date: '21 Feb 10:00', type: 'Wallet Recharge', ref: 'UT991', amt: '25,000', note: 'Fund Approved' },
            { date: '15 Feb 14:00', type: 'Wallet Recharge', ref: 'UT982', amt: '50,000', note: 'Direct Credit' },
        ]}
    />
);

export default PurchaseReport;
