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
  // State variables for delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  // Function to show delete confirmation modal
  const handleDelete = (id) => {
    setOrderToDelete(id);
    setShowDeleteConfirmModal(true);
  };

  // Function to confirm deletion
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWorkOrder(orderToDelete);
      setAlert({ type: "success", message: "Work order deleted successfully!" });
      fetchOrders();
      setShowDeleteConfirmModal(false);
      setOrderToDelete(null);
    } catch (error) {
      setAlert({ type: "error", message: "Failed to delete work order" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setOrderToDelete(null);
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
      </div>      {/* Add/Edit Modal */}
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
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this work order? This action cannot be undone.
            </p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                disabled={isDeleting} // Disable button while deleting
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderManagementPage;
