import React, { useState, useEffect } from 'react';
import { getWorkOrders, deleteWorkOrder, searchWorkOrders } from '../../services/workOrderService';
import WorkOrderTable from '../../components/admin/confined/WorkOrderTable';
import WorkOrderModal from '../../components/admin/confined/WorkOrderModel';
import WorkOrderSearch from '../../components/admin/confined/WorkOrderSearch';
import WorkOrderAlert from '../../components/admin/confined/WorkOrderAlert';
import { toast } from 'react-toastify';

const WorkOrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Fetch all orders
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    try {
      const data = Object.keys(params).length
        ? await searchWorkOrders(params)
        : await getWorkOrders();
      setOrders(data);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search handler
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearch(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(search);
  };

  // Modal handlers
  const handleAdd = () => {
    setCurrentOrder(null);
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEdit = (order) => {
    setCurrentOrder(order);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this work order?")) return;
    try {
      await deleteWorkOrder(id);
      setAlert({ type: "success", message: "Order deleted!" });
      fetchOrders();
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete order" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Confined Space Work Orders</h1>
              <p className="mt-2 text-base sm:text-lg text-gray-700">Manage and track confined space work orders</p>
            </div>
            <button
              onClick={handleAdd}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Confined Space Work Order
            </button>
          </div>
        </div>

        {/* Alert Section */}
        <div className="mb-6 sm:mb-8">
          <WorkOrderAlert type={alert.type} message={alert.message} />
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <WorkOrderSearch 
            search={search} 
            onChange={handleSearchChange} 
            onSearch={handleSearch} 
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <WorkOrderTable 
                orders={orders} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <WorkOrderModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => {
          fetchOrders();
          setShowModal(false);
        }}
        order={currentOrder}
        isEdit={isEdit}
      />
    </div>
  );
};

export default WorkOrderManagementPage;
