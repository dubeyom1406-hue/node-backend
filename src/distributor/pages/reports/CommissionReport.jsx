import React from 'react';
import ReportTable from './ReportTable';

const CommissionReport = () => (
    <ReportTable
        title="Commission Report"
        columns={[
            { label: 'Date/Time', key: 'date' },
            { label: 'Retailer', key: 'retailer' },
            { label: 'Service', key: 'service' },
            { label: 'Ref ID', key: 'ref' },
            { label: 'Txn Amt', key: 'amt' },
            { label: 'My Commission', key: 'comm', render: (v) => <span className="text-emerald-600 font-black">₹ {v}</span> },
            { label: 'Status', key: 'status', render: (v) => <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full border border-emerald-100">Settled</span> }
        ]}
        data={[
            { date: '2025-02-20 14:22', retailer: 'Rahul Store', service: 'AEPS', ref: 'TXN88221', amt: '10,000', comm: '5.00' },
            { date: '2025-02-20 12:45', retailer: 'Ajay Tele', service: 'DMT', ref: 'TXN88222', amt: '2,500', comm: '2.50' },
            { date: '2025-02-19 16:10', retailer: 'Sumit Kirana', service: 'BBPS', ref: 'TXN88223', amt: '840', comm: '1.20' },
        ]}
    />
);

export default CommissionReport;
