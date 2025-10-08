import { useState, useEffect } from 'react';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Card from '../components/Card';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Clock, Play, Square, Check, X, Edit, Eye, Coffee } from 'lucide-react';

export default function Attendance() {
  const { showSuccess, showError } = useToast();
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState('PRESENT');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [todayAttendances, setTodayAttendances] = useState([]);
  const [daySummaries, setDaySummaries] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);
  const [approvalAction, setApprovalAction] = useState('');
  const [justification, setJustification] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    approvalStatus: '',
    employeeId: ''
  });

  useEffect(() => {
    fetchAttendances();
    fetchTodayAttendances();
    fetchEmployees();
  }, [currentMonth, currentYear, filters]);

  const fetchAttendances = async () => {
    try {
      const dateFrom = new Date(currentYear, currentMonth - 1, 1);
      const dateTo = new Date(currentYear, currentMonth, 0);

      const params = {
        dateFrom: dateFrom.toISOString().split('T')[0],
        dateTo: dateTo.toISOString().split('T')[0],
        ...filters
      };

      const response = await api.get('/attendance/search', { params });
      setAttendances(response.data);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchTodayAttendances = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance', {
        params: {
          dateFrom: today,
          dateTo: today
        }
      });
      setTodayAttendances(response.data);
    } catch (error) {
      console.error('Error fetching today attendances:', error);
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const attendanceData = {
        employeeId: selectedEmployee.id,
        date: selectedDate,
        checkInTime: checkInTime || null,
        checkOutTime: checkOutTime || null,
        status,
        notes: notes || null,
      };

      await api.post('/attendance', attendanceData);

      setShowModal(false);
      resetForm();
      fetchAttendances();
      showSuccess('Pointage enregistré avec succès');
    } catch (error) {
      console.error('Error creating attendance:', error);
      showError('Erreur lors de l\'enregistrement du pointage');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setCheckInTime('');
    setCheckOutTime('');
    setStatus('PRESENT');
    setNotes('');
  };

  const openAttendanceModal = (employee = null) => {
    if (employee) {
      setSelectedEmployee(employee);
    }
    setShowModal(true);
  };

  const handleCheckIn = async (employeeId) => {
    try {
      await api.post('/attendance/checkin', { employeeId });
      fetchTodayAttendances();
      showSuccess('Check-in enregistré');
    } catch (error) {
      console.error('Error checking in:', error);
      showError('Erreur lors du check-in');
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      await api.post('/attendance/checkout', { employeeId });
      fetchTodayAttendances();
      showSuccess('Check-out enregistré');
    } catch (error) {
      console.error('Error checking out:', error);
      showError('Erreur lors du check-out');
    }
  };

  const downloadMonthlyReport = async () => {
    try {
      const response = await api.get(`/attendance/report/monthly/pdf?year=${currentYear}&month=${currentMonth}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${currentYear}-${currentMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      showError('Erreur lors du téléchargement du rapport');
    }
  };

  // Break management
  const handleStartBreak = async (attendanceId) => {
    try {
      await api.post('/attendance/break/start', { attendanceId });
      fetchAttendances();
      showSuccess('Pause démarrée');
    } catch (error) {
      console.error('Error starting break:', error);
      showError('Erreur lors du démarrage de la pause');
    }
  };

  const handleEndBreak = async (attendanceId) => {
    try {
      await api.post('/attendance/break/end', { attendanceId });
      fetchAttendances();
      showSuccess('Pause terminée');
    } catch (error) {
      console.error('Error ending break:', error);
      showError('Erreur lors de la fin de la pause');
    }
  };

  // Approval workflow
  const handleApproveAttendance = async (attendanceId, justificationText) => {
    try {
      await api.post(`/attendance/${attendanceId}/approve`, { justification: justificationText });
      fetchAttendances();
      setShowApprovalModal(false);
      showSuccess('Pointage approuvé');
    } catch (error) {
      console.error('Error approving attendance:', error);
      showError('Erreur lors de l\'approbation');
    }
  };

  const handleRejectAttendance = async (attendanceId, justificationText) => {
    try {
      await api.post(`/attendance/${attendanceId}/reject`, { justification: justificationText });
      fetchAttendances();
      setShowApprovalModal(false);
      showSuccess('Pointage rejeté');
    } catch (error) {
      console.error('Error rejecting attendance:', error);
      showError('Erreur lors du rejet');
    }
  };

  const handleCorrectAttendance = async (attendanceId, correctionData, justificationText) => {
    try {
      await api.post(`/attendance/${attendanceId}/correct`, {
        correctionData,
        justification: justificationText
      });
      fetchAttendances();
      setShowApprovalModal(false);
      showSuccess('Pointage corrigé');
    } catch (error) {
      console.error('Error correcting attendance:', error);
      showError('Erreur lors de la correction');
    }
  };

  // Audit trail
  const handleViewAuditTrail = async (attendanceId) => {
    try {
      const response = await api.get(`/attendance/${attendanceId}/audit`);
      setAuditTrail(response.data);
      setShowAuditModal(true);
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      showError('Erreur lors de la récupération de l\'historique');
    }
  };

  // Modal handlers
  const openApprovalModal = (attendance, action) => {
    setSelectedAttendance(attendance);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = (e) => {
    e.preventDefault();
    if (!selectedAttendance) return;

    switch (approvalAction) {
      case 'approve':
        handleApproveAttendance(selectedAttendance.id, justification);
        break;
      case 'reject':
        handleRejectAttendance(selectedAttendance.id, justification);
        break;
      case 'correct':
        // For correction, we would need a form with correction fields
        // For now, just approve
        handleApproveAttendance(selectedAttendance.id, justification);
        break;
    }
    setJustification('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'success';
      case 'ABSENT': return 'danger';
      case 'RETARD': return 'warning';
      case 'CONGE': return 'info';
      case 'MALADIE': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      PRESENT: 'Présent',
      ABSENT: 'Absent',
      RETARD: 'Retard',
      CONGE: 'Congé',
      MALADIE: 'Maladie',
      AUTRE: 'Autre'
    };
    return statuses[status] || status;
  };

  const headers = ['Employé', 'Date', 'Arrivée', 'Départ', 'Pause', 'Heures', 'Statut', 'Approbation', 'Actions'];

  const renderRow = (attendance) => (
    <tr key={attendance.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {attendance.employee?.nomComplet || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(attendance.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attendance.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString() : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attendance.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString() : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attendance.breakHours ? `${attendance.breakHours}h` : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {attendance.hoursWorked ? `${attendance.hoursWorked}h` : '-'}
        {attendance.overtimeHours ? ` (+${attendance.overtimeHours}h sup.)` : ''}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={getStatusColor(attendance.status)}>
          {getStatusText(attendance.status)}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={
          attendance.approvalStatus === 'APPROVED' ? 'success' :
          attendance.approvalStatus === 'REJECTED' ? 'danger' :
          attendance.approvalStatus === 'CORRECTED' ? 'warning' :
          'default'
        }>
          {attendance.approvalStatus === 'APPROVED' ? 'Approuvé' :
           attendance.approvalStatus === 'REJECTED' ? 'Rejeté' :
           attendance.approvalStatus === 'CORRECTED' ? 'Corrigé' :
           'En attente'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-1">
          {/* Check-in/Check-out buttons */}
          {!attendance.checkInTime && (
            <Button
              onClick={() => handleCheckIn(attendance.employeeId)}
              size="sm"
              variant="outline"
              title="Check-in"
            >
              <Clock size={14} />
            </Button>
          )}
          {attendance.checkInTime && !attendance.checkOutTime && (
            <Button
              onClick={() => handleCheckOut(attendance.employeeId)}
              size="sm"
              title="Check-out"
            >
              <Square size={14} />
            </Button>
          )}

          {/* Break management */}
          {attendance.checkInTime && !attendance.checkOutTime && (
            <>
              {!attendance.breakStartTime && (
                <Button
                  onClick={() => handleStartBreak(attendance.id)}
                  size="sm"
                  variant="outline"
                  title="Démarrer pause"
                >
                  <Coffee size={14} />
                </Button>
              )}
              {attendance.breakStartTime && !attendance.breakEndTime && (
                <Button
                  onClick={() => handleEndBreak(attendance.id)}
                  size="sm"
                  variant="secondary"
                  title="Terminer pause"
                >
                  <Square size={14} />
                </Button>
              )}
            </>
          )}

          {/* Approval actions */}
          {attendance.approvalStatus === 'PENDING' && (
            <>
              <Button
                onClick={() => openApprovalModal(attendance, 'approve')}
                size="sm"
                variant="outline"
                title="Approuver"
              >
                <Check size={14} />
              </Button>
              <Button
                onClick={() => openApprovalModal(attendance, 'reject')}
                size="sm"
                variant="outline"
                title="Rejeter"
              >
                <X size={14} />
              </Button>
            </>
          )}

          {/* Audit trail */}
          <Button
            onClick={() => handleViewAuditTrail(attendance.id)}
            size="sm"
            variant="outline"
            title="Historique"
          >
            <Eye size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Pointages</h1>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={currentYear - 2 + i} value={currentYear - 2 + i}>
                    {currentYear - 2 + i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => openAttendanceModal()} variant="outline">
              Nouveau pointage
            </Button>
            <Button onClick={downloadMonthlyReport} variant="outline">
              Rapport PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous</option>
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="RETARD">Retard</option>
              <option value="CONGE">Congé</option>
              <option value="MALADIE">Maladie</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approbation</label>
            <select
              value={filters.approvalStatus}
              onChange={(e) => setFilters({...filters, approvalStatus: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Toutes</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
              <option value="CORRECTED">Corrigé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employé</label>
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nomComplet}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => fetchAttendances()} variant="outline" className="w-full">
              Filtrer
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Check-in/Check-out Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Pointages du jour ({new Date().toLocaleDateString('fr-FR')})</h2>
        <div className="space-y-4">
          {employees.map((employee) => {
            // Check if employee has attendance for today
            const todayAttendance = todayAttendances.find(att =>
              att.employeeId === employee.id &&
              new Date(att.date).toDateString() === new Date().toDateString()
            );

            return (
              <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{employee.nomComplet}</h3>
                  <p className="text-sm text-gray-600">{employee.poste}</p>
                  {todayAttendance && (
                    <div className="text-sm text-gray-500 mt-1">
                      Statut: <span className={`px-2 py-1 rounded text-xs ${
                        todayAttendance.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                        todayAttendance.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusText(todayAttendance.status)}
                      </span>
                      {todayAttendance.hoursWorked && ` • ${todayAttendance.hoursWorked}h travaillées`}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!todayAttendance && (
                    <Button
                      onClick={() => handleCheckIn(employee.id)}
                      size="sm"
                      variant="outline"
                    >
                      Check-in
                    </Button>
                  )}
                  {todayAttendance && !todayAttendance.checkOutTime && (
                    <Button
                      onClick={() => handleCheckOut(employee.id)}
                      size="sm"
                    >
                      Check-out
                    </Button>
                  )}
                  {todayAttendance && todayAttendance.checkOutTime && (
                    <span className="text-sm text-green-600 font-medium">Journée terminée</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-4">Historique des pointages ({new Date(currentYear, currentMonth - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()})</h2>
        {attendances.length > 0 ? (
          <Table headers={headers} data={attendances} renderRow={renderRow} />
        ) : (
          <p className="text-gray-500 text-center py-4">Aucun pointage pour cette période</p>
        )}
      </div>

      {/* Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enregistrer un pointage"
      >
        <form onSubmit={handleSubmitAttendance}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employé
            </label>
            <select
              value={selectedEmployee?.id || ''}
              onChange={(e) => {
                const employee = employees.find(emp => emp.id === parseInt(e.target.value));
                setSelectedEmployee(employee);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Sélectionner un employé</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.nomComplet} - {employee.poste}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure d'arrivée
              </label>
              <input
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de départ
              </label>
              <input
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="PRESENT">Présent</option>
              <option value="ABSENT">Absent</option>
              <option value="RETARD">Retard</option>
              <option value="CONGE">Congé</option>
              <option value="MALADIE">Maladie</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Commentaires sur le pointage"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title={`${
          approvalAction === 'approve' ? 'Approuver' :
          approvalAction === 'reject' ? 'Rejeter' :
          'Corriger'
        } le pointage`}
      >
        <form onSubmit={handleApprovalSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Pointage de {selectedAttendance?.employee?.nomComplet} du {selectedAttendance ? new Date(selectedAttendance.date).toLocaleDateString() : ''}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Justification (optionnel)
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Raison de l'approbation/rejet..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApprovalModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {approvalAction === 'approve' ? 'Approuver' :
               approvalAction === 'reject' ? 'Rejeter' :
               'Corriger'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Audit Trail Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Historique des modifications"
      >
        <div className="space-y-4">
          {auditTrail.length > 0 ? (
            auditTrail.map((entry, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{entry.action}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.performedAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Par: {entry.performedBy?.nom || 'Système'}
                </div>
                {entry.justification && (
                  <div className="text-sm">
                    <strong>Justification:</strong> {entry.justification}
                  </div>
                )}
                {entry.oldValues && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Ancien:</strong> {JSON.stringify(JSON.parse(entry.oldValues), null, 2)}
                  </div>
                )}
                {entry.newValues && (
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Nouveau:</strong> {JSON.stringify(JSON.parse(entry.newValues), null, 2)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun historique disponible</p>
          )}
        </div>
      </Modal>
    </div>
  );
}