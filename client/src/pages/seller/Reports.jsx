import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, ShoppingBag, ArrowRight, BarChart3 } from 'lucide-react';

const reportCards = [
  {
    title: 'Party Statement',
    description: 'View dues, sales, and payment history for each customer or supplier.',
    icon: Users,
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    route: '/seller/reports/party-statement',
  },
  {
    title: 'Sales Overview',
    description: 'Track overall orders and sales with a custom date range.',
    icon: TrendingUp,
    color: 'from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    route: '/seller/reports/sales-overview',
  },
  {
    title: 'Best Sellers',
    description: 'Review sales-by-item.',
    icon: ShoppingBag,
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    route: '/seller/reports/best-sellers',
  },
];

const Reports = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen py-3 px-3 sm:py-6 sm:px-4">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#EB8A14] to-[#d97706] shadow-md">
              <BarChart3 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Reports</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">Choose a report to open</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reportCards.map((card) => {
            const Icon = card.icon;

            return (
              <button
                key={card.title}
                onClick={() => navigate(card.route)}
                className={`${card.bgColor} rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 ${card.borderColor} hover:shadow-xl active:scale-95 sm:hover:scale-[1.02] transition-all text-left flex flex-col h-full`}
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-md w-fit mb-4`}>
                  <Icon className="text-white" size={22} />
                </div>
                <h3 className={`text-lg font-bold ${card.textColor} mb-1`}>{card.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">{card.description}</p>
                <div className={`flex items-center gap-1 text-sm font-bold ${card.textColor}`}>
                  <span>View Report</span>
                  <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;