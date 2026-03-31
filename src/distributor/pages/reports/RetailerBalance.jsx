import React from 'react';
import ReportTable from './ReportTable';

const RetailerBalance = () => (
    <ReportTable
        title="Retailer Balance Report"
        columns={[
            { label: 'Retailer Name', key: 'name' },
            { label: 'Business', key: 'biz' },
            { label: 'Mobile', key: 'mobile' },
            { label: 'Wallet Balance', key: 'bal', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Last Lead', key: 'last' },
            { label: 'Status', key: 'status' }
        ]}
        data={[
            { name: 'Rahul Kumar', biz: 'Rahul General Store', mobile: '9876001122', bal: '12,450.00', last: '20 Feb', status: 'Approved' },
            { name: 'Ajay Singh', biz: 'Ajay Telecom', mobile: '9988776655', bal: '8,200.00', last: '18 Feb', status: 'Approved' },
        ]}
    />
);

export default RetailerBalance;
