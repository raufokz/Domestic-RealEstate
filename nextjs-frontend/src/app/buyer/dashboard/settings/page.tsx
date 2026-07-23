"use client";

import BuyerLayout from "@/components/buyer/BuyerLayout";

export default function BuyerSettingsPage() {
  return (
    <BuyerLayout title="Buyer Settings" subtitle="Configure your account and notification preferences.">
      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Display Name</label>
              <input type="text" defaultValue="John Smith" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input type="email" defaultValue="john.smith@email.com" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Language</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Currency</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] bg-white focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Email Notifications</h2>
          <div className="space-y-4">
            {[
              { label: "New property matches", description: "Get notified when new properties match your searches", enabled: true },
              { label: "Price changes", description: "Alerts when saved properties change price", enabled: true },
              { label: "Message notifications", description: "New messages from your agent", enabled: true },
              { label: "Offer updates", description: "Status changes on your offers", enabled: true },
              { label: "Market reports", description: "Weekly market summary for your areas", enabled: false },
              { label: "Newsletter", description: "Tips and insights from Domestic Real Estate", enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#0A2647]">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <button className={`w-11 h-6 rounded-full transition-colors relative ${item.enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-[#0A2647] mb-4">Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
              <input type="password" placeholder="Enter current password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
              <input type="password" placeholder="Enter new password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New Password</label>
              <input type="password" placeholder="Confirm new password" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0A2647] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="border border-slate-200 text-slate-600 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
            Cancel
          </button>
          <button className="bg-[#C9A227] text-[#0A2647] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b8911f] transition">
            Save Settings
          </button>
        </div>
      </div>
    </BuyerLayout>
  );
}
