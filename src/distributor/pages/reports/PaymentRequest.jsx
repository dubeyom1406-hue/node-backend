import React from 'react';
import ReportTable from './ReportTable';

const PaymentRequest = () => (
    <ReportTable
        title="Payment Request Report"
        columns={[
            { label: 'Req Date', key: 'date' },
            { label: 'Mode', key: 'mode' },
            { label: 'Ref/UTR', key: 'utr' },
            { label: 'Bank', key: 'bank' },
            { label: 'Amount', key: 'amt', render: (v) => <span className="font-black text-slate-800">₹ {v}</span> },
            { label: 'Status', key: 'status', render: (v) => <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${v === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{v}</span> }
        ]}
        data={[
            { date: '20 Feb 11:30', mode: 'Bank Transfer', utr: 'UTR8872110', bank: 'ICICI', amt: '50,000', status: 'Approved' },
            { date: '18 Feb 16:45', mode: 'CDM Deposit', utr: 'REF99012', bank: 'SBI', amt: '10,000', status: 'Approved' },
        ]}
    />
);

export default PaymentRequest;
