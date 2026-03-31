import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'user_banks_v1';

const sampleBanks = [
  {
    id: 1,
    acType: 'SAVING',
    acOwner: 'SELF',
    acNumber: '35861315988',
    acHolder: 'AJAY KUMAR',
    ifsc: 'SBIN0006447',
    bank: 'STATE BANK OF INDIA - SBI',
    branch: 'ARMY AHYAPUR',
    status: 'APPROVED',
  },
  {
    id: 2,
    acType: 'CURRENT',
    acOwner: 'SELF',
    acNumber: '33859717255',
    acHolder: 'Ajay Kumar',
    ifsc: 'SBIN0006447',
    bank: 'STATE BANK OF INDIA',
    branch: 'AGRI MKT YARD AHYAPUR',
    status: 'APPROVED',
  },
];

export default function BankingDetails() {
  const [banks, setBanks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    acType: 'SAVING',
    acOwner: 'SELF',
    acNumber: '',
    acHolder: '',
    ifsc: '',
    bank: '',
    branch: '',
    status: 'PENDING',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBanks(JSON.parse(raw));
      else setBanks(sampleBanks);
    } catch (e) {
      setBanks(sampleBanks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banks));
  }, [banks]);

  function openModal() {
    setForm({
      acType: 'SAVING',
      acOwner: 'SELF',
      acNumber: '',
      acHolder: '',
      ifsc: '',
      bank: '',
      branch: '',
      status: 'PENDING',
    });
    setError('');
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validate() {
    if (!form.acNumber || form.acNumber.length < 6) return 'Enter a valid account number';
    if (!form.acHolder) return 'Enter account holder name';
    if (!form.ifsc || form.ifsc.length < 4) return 'Enter valid IFSC';
    if (!form.bank) return 'Enter bank name';
    return '';
  }

  function addBank() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    const newBank = { ...form, id: Date.now() };
    setBanks((b) => [...b, newBank]);
    setShowModal(false);
  }

  function removeBank(id) {
    if (!confirm('Remove this bank?')) return;
    setBanks((b) => b.filter((x) => x.id !== id));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-700">Banking Details</h2>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-full shadow"
        >
          <PlusCircle size={16} />
          <span className="font-bold">Add Bank</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  'S.No.',
                  'A/c Type',
                  'A/c Owner',
                  'A/c Number',
                  'A/c Holder',
                  'IFSC',
                  'Bank',
                  'Branch',
                  'Status',
                  'Action',
                ].map((h) => (
                  <th key={h} className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-tight">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banks.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-sm text-slate-400">
                    No bank details added.
                  </td>
                </tr>
              )}

              {banks.map((b, idx) => (
                <tr key={b.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-600">{b.acType}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.acOwner}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.acNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.acHolder}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.ifsc}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.bank}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{b.branch}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-black">{b.status}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <button onClick={() => removeBank(b.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Bank</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-slate-500">A/c Type</label>
                <select name="acType" value={form.acType} onChange={handleChange} className="w-full border rounded p-2">
                  <option>SAVING</option>
                  <option>CURRENT</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-500">A/c Owner</label>
                <select name="acOwner" value={form.acOwner} onChange={handleChange} className="w-full border rounded p-2">
                  <option>SELF</option>
                  <option>JOINT</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[12px] font-bold text-slate-500">A/c Number</label>
                <input name="acNumber" value={form.acNumber} onChange={handleChange} className="w-full border rounded p-2" />
              </div>

              <div className="col-span-2">
                <label className="text-[12px] font-bold text-slate-500">A/c Holder</label>
                <input name="acHolder" value={form.acHolder} onChange={handleChange} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-500">IFSC</label>
                <input name="ifsc" value={form.ifsc} onChange={handleChange} className="w-full border rounded p-2" />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-500">Bank</label>
                <input name="bank" value={form.bank} onChange={handleChange} className="w-full border rounded p-2" />
              </div>

              <div className="col-span-2">
                <label className="text-[12px] font-bold text-slate-500">Branch</label>
                <input name="branch" value={form.branch} onChange={handleChange} className="w-full border rounded p-2" />
              </div>

              <div className="col-span-2 text-right">
                {error && <div className="text-red-600 font-bold mb-2">{error}</div>}
                <button onClick={() => setShowModal(false)} className="mr-3 px-4 py-2 rounded border">Cancel</button>
                <button onClick={addBank} className="px-4 py-2 bg-blue-700 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
