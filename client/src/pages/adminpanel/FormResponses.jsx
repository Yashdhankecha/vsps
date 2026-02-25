import React, { useState, useEffect } from 'react';
import {
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    DocumentIcon,
    ArrowDownTrayIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    ArrowPathIcon,
    CalendarIcon,
    UserIcon,
    MapPinIcon,
    PhoneIcon,
    EnvelopeIcon,
    AcademicCapIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import {
    CheckCircleIcon as CheckCircleIconSolid,
    XCircleIcon as XCircleIconSolid,
    ExclamationTriangleIcon as ExclamationTriangleIconSolid,
    ShieldCheckIcon as ShieldCheckIconSolid
} from '@heroicons/react/24/solid';
import axiosInstance from '../../utils/axiosConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Button, Input } from '../../components';

// Helper Components
const Notification = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-[150] p-4 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in-right border ${type === 'success'
            ? 'bg-neon-500/10 border-neon-500/20 text-neon-600'
            : 'bg-red-500/10 border-red-500/20 text-red-600'
            }`}>
            {type === 'success' ? <CheckCircleIconSolid className="w-5 h-5" /> : <XCircleIconSolid className="w-5 h-5" />}
            <p className="font-bold">{message}</p>
        </div>
    );
};

const RejectionModal = ({ onClose, onSubmit, bookingType }) => {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <Card className="w-full max-w-md p-8 shadow-2xl border-gray-200">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                        <XMarkIcon className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Reject {bookingType}</h3>
                        <p className="text-gray-500 text-sm">Please provide a reason for rejection</p>
                    </div>
                </div>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Incomplete documentation or details mismatch..."
                    className="w-full h-32 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium text-gray-700 mb-6"
                />

                <div className="flex space-x-3">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={() => onSubmit(reason)}
                        className="flex-1 bg-red-600 hover:bg-red-700 shadow-red-500/20"
                        disabled={!reason.trim()}
                    >
                        Confirm Rejection
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const FormResponses = () => {
    const [activeTab, setActiveTab] = useState('samuhLagan'); // samuhLagan or studentAwards
    const [samuhLaganRequests, setSamuhLaganRequests] = useState([]);
    const [studentAwardRequests, setStudentAwardRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Modals state
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionTarget, setRejectionTarget] = useState({ id: null, type: null });
    const [selectedResponse, setSelectedResponse] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Action loading states
    const [loadingActions, setLoadingActions] = useState({
        approve: {},
        reject: {},
        confirm: {},
        delete: {}
    });

    useEffect(() => {
        fetchResponses();
    }, []);

    const fetchResponses = async () => {
        try {
            setLoading(true);
            const [samuhRes, studentRes] = await Promise.all([
                axiosInstance.get('/api/bookings/samuh-lagan'),
                axiosInstance.get('/api/bookings/student-awards')
            ]);

            const samuhData = Array.isArray(samuhRes.data) ? samuhRes.data :
                Array.isArray(samuhRes.data?.bookings) ? samuhRes.data.bookings : [];
            const studentData = Array.isArray(studentRes.data) ? studentRes.data :
                Array.isArray(studentRes.data?.awards) ? studentRes.data.awards : [];

            setSamuhLaganRequests(samuhData);
            setStudentAwardRequests(studentData);
            setError(null);
        } catch (err) {
            console.error('Error fetching form responses:', err);
            setError('Failed to fetch synchronization data');
        } finally {
            setLoading(false);
        }
    };

    const showNotify = (message, type = 'success') => {
        setNotification({ message, type });
    };

    // Approval / Rejection Handlers
    const handleApproveSamuhLagan = async (id) => {
        try {
            setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: true } }));
            await axiosInstance.patch(`/api/bookings/samuh-lagan/${id}/approve`, {});
            showNotify('Registration approved successfully');
            setShowDetailModal(false);
            fetchResponses();
        } catch (err) {
            showNotify(err.response?.data?.error || 'Approval failed', 'error');
        } finally {
            setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: false } }));
        }
    };

    const handleConfirmSamuhPayment = async (id) => {
        try {
            setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: true } }));
            await axiosInstance.patch(`/api/bookings/samuh-lagan/${id}/confirm-payment`, {});
            showNotify('Payment confirmed and registration complete');
            setShowDetailModal(false);
            fetchResponses();
        } catch (err) {
            showNotify('Failed to confirm payment', 'error');
        } finally {
            setLoadingActions(prev => ({ ...prev, confirm: { ...prev.confirm, [id]: false } }));
        }
    };

    const handleApproveStudentAward = async (id) => {
        try {
            setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: true } }));
            await axiosInstance.put(`/api/bookings/student-awards/approve/${id}`);
            showNotify('Award registration approved');
            setShowDetailModal(false);
            fetchResponses();
        } catch (err) {
            showNotify('Approval failed', 'error');
        } finally {
            setLoadingActions(prev => ({ ...prev, approve: { ...prev.approve, [id]: false } }));
        }
    };

    const openRejectionModal = (id, type) => {
        setRejectionTarget({ id, type });
        setShowRejectionModal(true);
    };

    const handleRejectionSubmit = async (reason) => {
        const { id, type } = rejectionTarget;
        try {
            setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [id]: true } }));
            if (type === 'samuhLagan') {
                await axiosInstance.patch(`/api/bookings/samuh-lagan/${id}/reject`, { reason });
            } else {
                await axiosInstance.put(`/api/bookings/student-awards/reject/${id}`, { rejectionReason: reason });
            }
            showNotify('Registration rejected successfully');
            setShowDetailModal(false);
            fetchResponses();
        } catch (err) {
            showNotify('Rejection failed', 'error');
        } finally {
            setLoadingActions(prev => ({ ...prev, reject: { ...prev.reject, [id]: false } }));
            setShowRejectionModal(false);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this response permanentally?')) return;
        try {
            setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [id]: true } }));
            if (type === 'samuhLagan') {
                await axiosInstance.delete(`/api/bookings/samuh-lagan/${id}`);
            } else {
                await axiosInstance.delete(`/api/bookings/student-awards/${id}`);
            }
            showNotify('Response deleted successfully');
            setShowDetailModal(false);
            fetchResponses();
        } catch (err) {
            showNotify('Deletion failed', 'error');
        } finally {
            setLoadingActions(prev => ({ ...prev, delete: { ...prev.delete, [id]: false } }));
        }
    };

    const viewDocument = (url) => {
        if (!url) {
            showNotify('No document available', 'error');
            return;
        };
        const formattedUrl = url.startsWith('http')
            ? url
            : `${axiosInstance.defaults.baseURL || 'http://localhost:3000'}${url.startsWith('/') ? '' : '/'}${url}`;
        window.open(formattedUrl, '_blank');
    };

    const openDetails = (response) => {
        setSelectedResponse(response);
        setShowDetailModal(true);
    };

    const ResponseDetailModal = ({ response, type, onClose }) => {
        if (!response) return null;
        const isSamuh = type === 'samuhLagan';

        return (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto p-0 shadow-2xl border-none bg-white rounded-[2.5rem]">
                    {/* Sticky Header */}
                    <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 px-10 py-8 border-b border-gray-100 flex justify-between items-center rounded-t-[2.5rem]">
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-700 rounded-2xl flex items-center justify-center shadow-lg shadow-electric-500/30 transform rotate-3">
                                <EyeIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Full Submission Details</h3>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs font-black text-electric-500 uppercase tracking-[0.2em]">Application ID: {response._id}</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${response.status === 'confirmed' || response.status === 'approved' ? 'bg-neon-100 text-neon-700' :
                                            response.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {response.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group">
                            <XMarkIcon className="w-8 h-8 text-gray-400 group-hover:text-gray-900" />
                        </button>
                    </div>

                    <div className="p-10">
                        {isSamuh ? (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Bride Detailed Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-8 h-8 bg-electric-100 rounded-lg flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-electric-600" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Bride Information</h4>
                                        </div>
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-5">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="font-bold text-gray-800 text-lg">{response.bride?.name}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p><p className="font-bold text-gray-800 text-lg">{response.bride?.age} Years</p></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Father's Name</p><p className="font-bold text-gray-700">{response.bride?.fatherName}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mother's Name</p><p className="font-bold text-gray-700">{response.bride?.motherName}</p></div>
                                            </div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Details</p>
                                                <p className="font-bold text-gray-700 flex items-center mt-1"><PhoneIcon className="w-4 h-4 mr-2" /> {response.bride?.contactNumber}</p>
                                                <p className="font-bold text-gray-500 flex items-center mt-1 text-sm"><EnvelopeIcon className="w-4 h-4 mr-2" /> {response.bride?.email}</p>
                                            </div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Permanent Address</p><p className="font-bold text-gray-600 text-sm leading-relaxed"><MapPinIcon className="w-4 h-4 inline mr-1" /> {response.bride?.address}</p></div>

                                            <div className="pt-4 flex space-x-3">
                                                <Button onClick={() => viewDocument(response.bride?.photo)} variant="secondary" className="flex-1 text-xs">View ID Photo</Button>
                                                {response.bride?.documents?.length > 0 && (
                                                    <Button onClick={() => viewDocument(response.bride.documents[0])} variant="secondary" className="flex-1 text-xs">Other Documents</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groom Detailed Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-8 h-8 bg-neon-100 rounded-lg flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-neon-600" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Groom Information</h4>
                                        </div>
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-5">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="font-bold text-gray-800 text-lg">{response.groom?.name}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Age</p><p className="font-bold text-gray-800 text-lg">{response.groom?.age} Years</p></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Father's Name</p><p className="font-bold text-gray-700">{response.groom?.fatherName}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mother's Name</p><p className="font-bold text-gray-700">{response.groom?.motherName}</p></div>
                                            </div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Details</p>
                                                <p className="font-bold text-gray-700 flex items-center mt-1"><PhoneIcon className="w-4 h-4 mr-2" /> {response.groom?.contactNumber}</p>
                                                <p className="font-bold text-gray-500 flex items-center mt-1 text-sm"><EnvelopeIcon className="w-4 h-4 mr-2" /> {response.groom?.email}</p>
                                            </div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Permanent Address</p><p className="font-bold text-gray-600 text-sm leading-relaxed"><MapPinIcon className="w-4 h-4 inline mr-1" /> {response.groom?.address}</p></div>

                                            <div className="pt-4 flex space-x-3">
                                                <Button onClick={() => viewDocument(response.groom?.photo)} variant="secondary" className="flex-1 text-xs">View ID Photo</Button>
                                                {response.groom?.documents?.length > 0 && (
                                                    <Button onClick={() => viewDocument(response.groom.documents[0])} variant="secondary" className="flex-1 text-xs">Other Documents</Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ceremony & Status Section */}
                                <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-electric-500/20 blur-[100px] -mr-32 -mt-32"></div>
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ceremony Date</p>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                                    <CalendarIcon className="w-6 h-6 text-electric-400" />
                                                </div>
                                                <p className="text-2xl font-black">{new Date(response.ceremonyDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Status</p>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${response.paymentStatus === 'paid' ? 'bg-neon-500/20 text-neon-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    <ShieldCheckIconSolid className="w-6 h-6" />
                                                </div>
                                                <p className="text-2xl font-black uppercase tracking-widest">{response.paymentStatus}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Overall Status</p>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/10`}>
                                                    {response.status === 'confirmed' ? <CheckIcon className="w-6 h-6 text-neon-400" /> : <ArrowPathIcon className="w-6 h-6 text-orange-400" />}
                                                </div>
                                                <p className="text-2xl font-black uppercase tracking-widest">{response.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {response.rejectionReason && (
                                        <div className="mt-10 pt-8 border-t border-white/10">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 text-red-400">Rejection Reason</p>
                                            <p className="text-gray-300 italic">"{response.rejectionReason}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Student Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-8 h-8 bg-electric-100 rounded-lg flex items-center justify-center">
                                                <AcademicCapIcon className="w-5 h-5 text-electric-600" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Student Information</h4>
                                        </div>
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-5">
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p><p className="font-bold text-gray-800 text-xl">{response.name}</p></div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p><p className="font-bold text-gray-700">{response.contactNumber}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p><p className="font-bold text-gray-700 text-sm">{response.email}</p></div>
                                            </div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Village / Town</p><p className="font-bold text-gray-700">{response.village}</p></div>
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Residential Address</p><p className="font-bold text-gray-600 text-sm leading-relaxed">{response.address}</p></div>
                                            <Button onClick={() => viewDocument(response.marksheet)} variant="primary" className="w-full mt-4 bg-electric-600 hover:bg-electric-700 shadow-xl shadow-electric-500/20">View Official Marksheet</Button>
                                        </div>
                                    </div>

                                    {/* Academic Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-8 h-8 bg-sunset-100 rounded-lg flex items-center justify-center">
                                                <StarIcon className="w-5 h-5 text-sunset-600" />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Academic Performance</h4>
                                        </div>
                                        <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-5">
                                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">School / Institute Name</p><p className="font-black text-gray-800 text-lg uppercase">{response.schoolName}</p></div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard / Grade</p><p className="font-bold text-gray-700 uppercase tracking-tighter">{response.standard}</p></div>
                                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Board / University</p><p className="font-bold text-gray-700 uppercase tracking-tighter">{response.boardName}</p></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                                                <div className="col-span-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Exam Year</p>
                                                    <p className="text-xl font-black text-gray-900">{response.examYear}</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-neon-600">Percentage</p>
                                                    <p className="text-3xl font-black text-neon-600">{response.totalPercentage}%</p>
                                                </div>
                                                <div className="col-span-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-electric-500">Rank Achieved</p>
                                                    <p className="text-3xl font-black text-electric-600 uppercase">#{response.rank}</p>
                                                </div>
                                            </div>
                                            {response.rejectionReason && (
                                                <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                                                    <p className="text-red-700 italic text-sm">"{response.rejectionReason}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons in Modal footer */}
                        <div className="mt-16 flex items-center justify-between pt-10 border-t-2 border-dashed border-gray-100">
                            <Button
                                onClick={() => handleDelete(response._id, type)}
                                variant="secondary"
                                className="px-8 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 transition-all font-black uppercase tracking-widest text-[10px]"
                                disabled={loadingActions.delete[response._id]}
                            >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                {loadingActions.delete[response._id] ? 'Deleting...' : 'Permanently Delete'}
                            </Button>

                            <div className="flex space-x-4">
                                {response.status === 'pending' && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => openRejectionModal(response._id, type)}
                                            className="px-10 font-black uppercase tracking-widest text-[10px] border-orange-200 text-orange-600 hover:bg-orange-50"
                                        >
                                            <XMarkIcon className="w-4 h-4 mr-2" /> Reject Application
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => isSamuh ? handleApproveSamuhLagan(response._id) : handleApproveStudentAward(response._id)}
                                            className="px-12 bg-neon-500 hover:bg-neon-600 shadow-xl shadow-neon-500/20 font-black uppercase tracking-widest text-[10px]"
                                            disabled={loadingActions.approve[response._id]}
                                        >
                                            <CheckIcon className="w-4 h-4 mr-2" /> {loadingActions.approve[response._id] ? 'Processing...' : 'Approve Submission'}
                                        </Button>
                                    </>
                                )}
                                {isSamuh && response.status === 'approved' && response.paymentStatus === 'pending' && (
                                    <Button
                                        onClick={() => handleConfirmSamuhPayment(response._id)}
                                        variant="primary"
                                        className="px-12 bg-electric-600 hover:bg-electric-700 shadow-xl shadow-electric-500/20 font-black uppercase tracking-widest text-[10px]"
                                        disabled={loadingActions.confirm[response._id]}
                                    >
                                        <ShieldCheckIconSolid className="w-4 h-4 mr-2" /> {loadingActions.confirm[response._id] ? 'Confirming...' : 'Confirm Payment Received'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    // Export Logic
    const exportToPDF = (type) => {
        const doc = new jsPDF();
        const isSamuh = type === 'samuhLagan';
        const data = isSamuh ? samuhLaganRequests : studentAwardRequests;
        const title = isSamuh ? 'Samuh Lagan Registrations' : 'Student Award Registrations';

        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Electric color
        doc.text(title, 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Records: ${data.length}`, 14, 33);

        const columns = isSamuh
            ? ['ID', 'Bride & Groom', 'Ceremony Date', 'Contact', 'Status', 'Payment']
            : ['ID', 'Student Name', 'School / Board', '%', 'Rank', 'Status'];

        const rows = data.map(item => isSamuh ? [
            item._id.substring(item._id.length - 6),
            `${item.bride?.name}\n&\n${item.groom?.name}`,
            new Date(item.ceremonyDate).toLocaleDateString(),
            `${item.bride?.phone}\n${item.groom?.phone}`,
            item.status.toUpperCase(),
            item.paymentStatus.toUpperCase()
        ] : [
            item._id.substring(item._id.length - 6),
            item.name,
            `${item.schoolName}\n${item.boardName}`,
            `${item.totalPercentage}%`,
            item.rank.toUpperCase(),
            item.status.toUpperCase()
        ]);

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                fontSize: 9,
                halign: 'center'
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                valign: 'middle',
                halign: 'center'
            },
            columnStyles: {
                1: { halign: 'left' }
            }
        });

        doc.save(`${type}-responses-${Date.now()}.pdf`);
    };

    if (loading && !samuhLaganRequests.length && !studentAwardRequests.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 texture-grid p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {notification && <Notification {...notification} onClose={() => setNotification(null)} />}

                {showRejectionModal && (
                    <RejectionModal
                        onClose={() => setShowRejectionModal(false)}
                        onSubmit={handleRejectionSubmit}
                        bookingType={rejectionTarget.type === 'samuhLagan' ? 'Samuh Lagan' : 'Student Award'}
                    />
                )}

                {showDetailModal && (
                    <ResponseDetailModal
                        response={selectedResponse}
                        type={activeTab}
                        onClose={() => setShowDetailModal(false)}
                    />
                )}

                {/* Header Section */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-sunset rounded-2xl flex items-center justify-center shadow-xl shadow-sunset-500/20 transform rotate-3">
                            <DocumentIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight italic">Form Responses</h1>
                            <p className="text-gray-500 font-medium">Review and verify applications for Samuh Lagan and Student Awards</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" onClick={fetchResponses} className="flex items-center space-x-2 border-gray-200">
                            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh Data</span>
                        </Button>
                        <Button variant="primary" onClick={() => exportToPDF(activeTab)} className="flex items-center space-x-2 bg-gray-900 hover:bg-black shadow-black/10">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Download PDF Report</span>
                        </Button>
                    </div>
                </div>

                {/* Tab System */}
                <div className="flex space-x-4 mb-8 p-2 bg-gray-200/50 backdrop-blur-md rounded-[2rem] w-fit">
                    {[
                        { id: 'samuhLagan', label: 'Samuh Lagan Registrations', count: samuhLaganRequests.length },
                        { id: 'studentAwards', label: 'Student Award Nominations', count: studentAwardRequests.length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-4 rounded-[1.5rem] text-sm font-black tracking-widest uppercase transition-all duration-500 flex items-center space-x-4 ${activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-2xl scale-105 neon-glow border border-gray-100'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
                                }`}
                        >
                            <span>{tab.label}</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${activeTab === tab.id ? 'bg-electric-500 text-white shadow-lg shadow-electric-500/40' : 'bg-gray-300 text-gray-600'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                {activeTab === 'samuhLagan' ? (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-4">
                            {samuhLaganRequests.length === 0 ? (
                                <Card className="p-24 text-center border-dashed border-2 border-gray-200 bg-white/50">
                                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <DocumentIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No Records Detected</h3>
                                    <p className="text-gray-500 font-medium">Wait for users to submit Samuh Lagan registration forms.</p>
                                </Card>
                            ) : (
                                <div className="overflow-x-auto rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl overflow-hidden">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-gray-50/80 border-b border-gray-200">
                                            <tr>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bride & Groom</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ceremony Date</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status & Payment</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {samuhLaganRequests.map((req) => (
                                                <tr key={req._id} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-electric-500 uppercase tracking-widest">ID: {req._id.substring(req._id.length - 6)}</span>
                                                            <span className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="w-2 h-2 rounded-full bg-electric-500"></span>
                                                                <span className="text-sm font-black text-gray-900">{req.bride?.name}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <span className="w-2 h-2 rounded-full bg-neon-500"></span>
                                                                <span className="text-sm font-black text-gray-500">{req.groom?.name}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center text-sm font-black text-gray-700">
                                                            <CalendarIcon className="w-4 h-4 mr-3 text-electric-500" />
                                                            {new Date(req.ceremonyDate).toLocaleDateString('en-GB')}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.status === 'confirmed' ? 'bg-neon-50 text-neon-700 border-neon-100' :
                                                                req.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                    req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                        'bg-orange-50 text-orange-700 border-orange-100'
                                                                }`}>
                                                                {req.status}
                                                            </span>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${req.paymentStatus === 'paid' ? 'bg-neon-500 text-white' : 'bg-white text-gray-400'}`}>
                                                                {req.paymentStatus}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => openDetails(req)}
                                                            className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-lg shadow-black/10 flex items-center ml-auto"
                                                        >
                                                            <EyeIcon className="w-4 h-4 mr-2" /> View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 gap-4">
                            {studentAwardRequests.length === 0 ? (
                                <Card className="p-24 text-center border-dashed border-2 border-gray-200 bg-white/50">
                                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <AcademicCapIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">No Nominations Found</h3>
                                    <p className="text-gray-500 font-medium">Wait for students to apply for achievement awards.</p>
                                </Card>
                            ) : (
                                <div className="overflow-x-auto rounded-[2.5rem] border border-gray-200 bg-white shadow-2xl overflow-hidden">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead className="bg-gray-50/80 border-b border-gray-200">
                                            <tr>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Award Candidate</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Academic info</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Performance</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {studentAwardRequests.map((req) => (
                                                <tr key={req._id} className="group hover:bg-slate-50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-12 h-12 bg-electric-50 rounded-2xl flex items-center justify-center font-black text-electric-500 text-lg shadow-inner">
                                                                {req.name?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-gray-900 leading-none">{req.name}</span>
                                                                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{req.village}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-black text-gray-700 tracking-tight">{req.schoolName}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{req.boardName} • {req.standard} Grade</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center space-x-4 font-black">
                                                            <div className="flex flex-col">
                                                                <span className="text-lg text-neon-600 leading-none">{req.totalPercentage}%</span>
                                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Overall</span>
                                                            </div>
                                                            <div className="w-px h-8 bg-gray-100"></div>
                                                            <div className="flex flex-col">
                                                                <span className="text-lg text-electric-600 leading-none uppercase">#{req.rank}</span>
                                                                <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Rank</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${req.status === 'approved' ? 'bg-neon-50 text-neon-700 border-neon-100' :
                                                            req.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-orange-50 text-orange-700 border-orange-100'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => openDetails(req)}
                                                            className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-lg shadow-black/10 flex items-center ml-auto"
                                                        >
                                                            <EyeIcon className="w-4 h-4 mr-2" /> View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormResponses;
