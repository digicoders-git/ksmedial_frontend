import { useState } from "react";
import { FaWallet, FaUniversity, FaCreditCard, FaHistory, FaPlus, FaEdit, FaTrash, FaUser, FaIdCard, FaFileUpload, FaEye, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const Withdrawal = () => {
  const [availableBalance] = useState(32000);
  const [minWithdrawal] = useState(500);
  const [withdrawalFee] = useState(50);
  const [isAdmin] = useState(false); // Set to true for admin view
  
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [kycCompleted, setKycCompleted] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "bank",
      name: "HDFC Bank",
      details: "Account: ****1234",
      accountNumber: "12345678901234",
      ifsc: "HDFC0001234",
      accountHolder: "John Doe",
      isDefault: true
    },
    {
      id: 2,
      type: "upi",
      name: "PhonePe",
      details: "UPI: john@phonepe",
      upiId: "john@phonepe",
      isDefault: false
    },
    {
      id: 3,
      type: "bank",
      name: "SBI Bank",
      details: "Account: ****5678",
      accountNumber: "98765432109876",
      ifsc: "SBIN0001234",
      accountHolder: "John Doe",
      isDefault: false
    }
  ]);

  const [withdrawalRequests, setWithdrawalRequests] = useState([
    {
      id: 1,
      userId: "USER001",
      userName: "John Doe",
      amount: 5000,
      method: "HDFC Bank",
      accountDetails: "****1234",
      date: "2024-01-20",
      status: "pending",
      referenceId: "WD001",
      fee: 50,
      kycStatus: "verified",
      userDetails: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 9876543210",
        address: "123 Main St, Mumbai",
        panCard: "ABCDE1234F",
        aadharCard: "1234 5678 9012",
        bankAccount: "12345678901234",
        ifscCode: "HDFC0001234"
      }
    },
    {
      id: 2,
      userId: "USER002",
      userName: "Jane Smith",
      amount: 3000,
      method: "SBI Bank",
      accountDetails: "****5678",
      date: "2024-01-19",
      status: "approved",
      referenceId: "WD002",
      fee: 50,
      kycStatus: "verified",
      userDetails: {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+91 9876543211",
        address: "456 Park Ave, Delhi",
        panCard: "FGHIJ5678K",
        aadharCard: "5678 9012 3456",
        bankAccount: "98765432109876",
        ifscCode: "SBIN0001234"
      }
    },
    {
      id: 3,
      userId: "USER003",
      userName: "Vikram Malhotra",
      amount: 4500,
      method: "ICICI Bank",
      accountDetails: "****9988",
      date: "2024-01-18",
      status: "pending",
      referenceId: "WD003",
      fee: 50,
      kycStatus: "pending", // This user's KYC is NOT verified
      userDetails: {
        name: "Vikram Malhotra",
        email: "vikram@example.com",
        phone: "+91 9876543212",
        address: "789 Ring Road, Bangalore",
        panCard: "KLMNO9012P",
        aadharCard: "9012 3456 7890",
        bankAccount: "11223344556677",
        ifscCode: "ICIC0001234"
      }
    }
  ]);

  const [kycData, setKycData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    panCard: "",
    aadharCard: "",
    panImage: null,
    aadharImage: null,
    bankPassbook: null
  });

  const [newMethod, setNewMethod] = useState({
    type: "bank",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    upiId: "",
    name: ""
  });

  const handleWithdrawal = () => {
    if (!kycCompleted) {
      toast.error("Please complete KYC verification first");
      setShowKYCForm(true);
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    
    if (!amount || amount < minWithdrawal) {
      toast.error(`Minimum withdrawal amount is ₹${minWithdrawal}`);
      return;
    }
    
    if (amount > availableBalance) {
      toast.error("Insufficient balance");
      return;
    }
    
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    const newRequest = {
      id: withdrawalRequests.length + 1,
      userId: "USER003",
      userName: "Current User",
      amount: amount,
      method: paymentMethods.find(m => m.id.toString() === selectedMethod)?.name,
      accountDetails: paymentMethods.find(m => m.id.toString() === selectedMethod)?.details,
      date: new Date().toISOString().split('T')[0],
      status: "pending",
      referenceId: `WD${String(withdrawalRequests.length + 1).padStart(3, '0')}`,
      fee: withdrawalFee,
      kycStatus: "verified",
      userDetails: {
        name: kycData.fullName,
        email: kycData.email,
        phone: kycData.phone,
        address: kycData.address,
        panCard: kycData.panCard,
        aadharCard: kycData.aadharCard
      }
    };

    setWithdrawalRequests([newRequest, ...withdrawalRequests]);
    setWithdrawalAmount("");
    setSelectedMethod("");
    toast.success("Withdrawal request submitted successfully!");
  };

  const addPaymentMethod = () => {
    if (newMethod.type === "bank") {
      if (!newMethod.accountNumber || !newMethod.ifsc || !newMethod.accountHolder) {
        toast.error("Please fill all bank details");
        return;
      }
    } else if (newMethod.type === "upi") {
      if (!newMethod.upiId) {
        toast.error("Please enter UPI ID");
        return;
      }
    }

    const method = {
      id: paymentMethods.length + 1,
      type: newMethod.type,
      name: newMethod.type === "bank" ? newMethod.name || "Bank Account" : "UPI",
      details: newMethod.type === "bank" 
        ? `Account: ****${newMethod.accountNumber.slice(-4)}`
        : `UPI: ${newMethod.upiId}`,
      ...newMethod,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewMethod({
      type: "bank",
      accountNumber: "",
      ifsc: "",
      accountHolder: "",
      upiId: "",
      name: ""
    });
    setShowAddMethod(false);
    toast.success("Payment method added successfully!");
  };

  const handleKYCSubmit = (e) => {
    e.preventDefault();
    if (!kycData.fullName || !kycData.email || !kycData.phone || !kycData.panCard || !kycData.aadharCard) {
      toast.error("Please fill all required fields");
      return;
    }
    setKycCompleted(true);
    setShowKYCForm(false);
    toast.success("KYC submitted successfully! You can now make withdrawal requests.");
  };

  const handleApproveRequest = (requestId) => {
    setWithdrawalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "approved" }
          : req
      )
    );
    toast.success("Request approved successfully!");
  };

  const handleRejectRequest = (requestId) => {
    setWithdrawalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "rejected" }
          : req
      )
    );
    toast.success("Request rejected!");
  };

  const handleCompletePayment = (requestId) => {
    setWithdrawalRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: "completed" }
          : req
      )
    );
    toast.success("Payment completed successfully!");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (type) => {
    switch(type) {
      case "bank": return <FaUniversity className="text-blue-600" />;
      case "upi": return <FaCreditCard className="text-purple-600" />;
      default: return <FaWallet className="text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isAdmin ? "Withdrawal Management" : "Withdraw Earnings"}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? "Manage user withdrawal requests" : "Transfer your earnings to your bank account"}
          </p>
        </div>

        {isAdmin ? (
          /* Admin View - Withdrawal Requests */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Withdrawal Requests (KYC Verified Only)</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">KYC Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawalRequests.filter(req => req.kycStatus === "verified").map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-600">
                          ₹{request.amount.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-500">Fee: ₹{request.fee}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.method}</div>
                        <div className="text-sm text-gray-500">{request.accountDetails}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          request.kycStatus === "verified" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {request.kycStatus === "verified" ? "✓ Verified" : "✗ Not Verified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRequestModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {request.status === "approved" && (
                            <button
                              onClick={() => handleCompletePayment(request.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                            >
                              Complete Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* User View */
          <>
            {/* KYC Status */}
            <div className={`rounded-xl p-6 mb-8 text-white ${kycCompleted ? 'bg-green-600' : 'bg-orange-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">KYC Verification</h3>
                  <p className="text-sm">
                    {kycCompleted ? 'KYC verified - You can make withdrawals' : 'Complete KYC to enable withdrawals'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <FaIdCard className="text-2xl" />
                  {!kycCompleted && (
                    <button
                      onClick={() => setShowKYCForm(true)}
                      className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Complete KYC
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Withdrawal Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">New Withdrawal</h3>
                  
                  {/* Balance Info */}
                  <div className="bg-[#007242] rounded-lg p-4 mb-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Available Balance</p>
                        <p className="text-2xl font-bold">₹{availableBalance.toLocaleString()}</p>
                      </div>
                      <FaWallet className="text-2xl text-green-200" />
                    </div>
                  </div>

                  {/* Withdrawal Amount */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter amount"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        min={minWithdrawal}
                        max={availableBalance}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Minimum: ₹{minWithdrawal}</span>
                      <span>Fee: ₹{withdrawalFee}</span>
                    </div>
                    {withdrawalAmount && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          You will receive: ₹{(parseFloat(withdrawalAmount) - withdrawalFee).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Payment Method
                      </label>
                      <button
                        onClick={() => setShowAddMethod(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <FaPlus className="text-xs" />
                        Add New
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedMethod === method.id.toString()
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedMethod(method.id.toString())}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getMethodIcon(method.type)}
                              <div>
                                <p className="font-medium text-gray-800">{method.name}</p>
                                <p className="text-sm text-gray-500">{method.details}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {method.isDefault && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Default
                                </span>
                              )}
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedMethod === method.id.toString()}
                                onChange={() => setSelectedMethod(method.id.toString())}
                                className="text-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleWithdrawal}
                    disabled={!withdrawalAmount || !selectedMethod || !kycCompleted}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {!kycCompleted ? "Complete KYC First" : "Submit Withdrawal Request"}
                  </button>
                </div>

                {/* Add Payment Method Modal */}
                {showAddMethod && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">Add Payment Method</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newMethod.type}
                          onChange={(e) => setNewMethod({...newMethod, type: e.target.value})}
                        >
                          <option value="bank">Bank Account</option>
                          <option value="upi">UPI</option>
                        </select>
                      </div>

                      {newMethod.type === "bank" ? (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={newMethod.name}
                              onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                              placeholder="e.g., HDFC Bank"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={newMethod.accountNumber}
                              onChange={(e) => setNewMethod({...newMethod, accountNumber: e.target.value})}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={newMethod.ifsc}
                              onChange={(e) => setNewMethod({...newMethod, ifsc: e.target.value})}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={newMethod.accountHolder}
                              onChange={(e) => setNewMethod({...newMethod, accountHolder: e.target.value})}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={newMethod.upiId}
                            onChange={(e) => setNewMethod({...newMethod, upiId: e.target.value})}
                            placeholder="yourname@upi"
                          />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAddMethod(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addPaymentMethod}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Withdrawal History */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                    <FaHistory />
                    Recent Requests
                  </h3>
                  
                  <div className="space-y-4">
                    {withdrawalRequests.filter(req => req.kycStatus === "verified" && (!isAdmin || req.userId === "USER003")).map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-800">₹{request.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">{request.method}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <p>Date: {request.date}</p>
                          <p>Ref: {request.referenceId}</p>
                          <p>Fee: ₹{request.fee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* KYC Form Modal */}
        {showKYCForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Complete KYC Verification</h3>
              
              <form onSubmit={handleKYCSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={kycData.fullName}
                    onChange={(e) => setKycData({...kycData, fullName: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={kycData.email}
                    onChange={(e) => setKycData({...kycData, email: e.target.value})}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={kycData.phone}
                    onChange={(e) => setKycData({...kycData, phone: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="PAN Card Number *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={kycData.panCard}
                    onChange={(e) => setKycData({...kycData, panCard: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Aadhar Card Number *"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={kycData.aadharCard}
                    onChange={(e) => setKycData({...kycData, aadharCard: e.target.value})}
                    required
                  />
                </div>
                <textarea
                  placeholder="Complete Address *"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  value={kycData.address}
                  onChange={(e) => setKycData({...kycData, address: e.target.value})}
                  required
                />
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Upload Documents</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">PAN Card Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-xs"
                        onChange={(e) => setKycData({...kycData, panImage: e.target.files[0]})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Aadhar Card Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-xs"
                        onChange={(e) => setKycData({...kycData, aadharImage: e.target.files[0]})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Bank Passbook</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-xs"
                        onChange={(e) => setKycData({...kycData, bankPassbook: e.target.files[0]})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowKYCForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit KYC
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {showRequestModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Withdrawal Request Details</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Request Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Amount:</span> <span className="font-medium text-green-600">₹{selectedRequest.amount.toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Fee:</span> <span className="font-medium">₹{selectedRequest.fee}</span></div>
                    <div><span className="text-gray-600">Net Amount:</span> <span className="font-medium">₹{(selectedRequest.amount - selectedRequest.fee).toLocaleString()}</span></div>
                    <div><span className="text-gray-600">Method:</span> <span className="font-medium">{selectedRequest.method}</span></div>
                    <div><span className="text-gray-600">Date:</span> <span className="font-medium">{selectedRequest.date}</span></div>
                    <div><span className="text-gray-600">Reference:</span> <span className="font-medium">{selectedRequest.referenceId}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">User Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> <span className="font-medium">{selectedRequest.userDetails.name}</span></div>
                    <div><span className="text-gray-600">Email:</span> <span className="font-medium">{selectedRequest.userDetails.email}</span></div>
                    <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{selectedRequest.userDetails.phone}</span></div>
                    <div><span className="text-gray-600">Address:</span> <span className="font-medium">{selectedRequest.userDetails.address}</span></div>
                    <div><span className="text-gray-600">PAN:</span> <span className="font-medium">{selectedRequest.userDetails.panCard}</span></div>
                    <div><span className="text-gray-600">Aadhar:</span> <span className="font-medium">{selectedRequest.userDetails.aadharCard}</span></div>
                  </div>
                </div>
              </div>

              {isAdmin && selectedRequest.status === "pending" && (
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                </div>
              )}

              {isAdmin && selectedRequest.status === "approved" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      handleCompletePayment(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Withdrawal;