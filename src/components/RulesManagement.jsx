import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Checkbox,
    FormControlLabel,
    FormGroup,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Snackbar,
    Alert,
    Box,
    Grid,
    Paper,
    IconButton,
    Typography,
    Autocomplete
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { createRule, getRules, updateRule, deleteRule } from '../api/rulesApi';
import { getGroups } from '../api/groupApi';

const days = [
    { label: 'Monday', value: 'Mon' },
    { label: 'Tuesday', value: 'Tue' },
    { label: 'Wednesday', value: 'Wed' },
    { label: 'Thursday', value: 'Thu' },
    { label: 'Friday', value: 'Fri' },
    { label: 'Saturday', value: 'Sat' },
    { label: 'Sunday', value: 'Sun' }
];

const columns = [
    {
        field: 'rule_name',
        headerName: 'Rule Name',
        flex: 1,
        minWidth: 150
    },
    {
        field: 'group_name',
        headerName: 'Group',
        flex: 1,
        minWidth: 150
    },
    {
        field: 'days',
        headerName: 'Days',
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => {
            const days = params;
            return Array.isArray(days) ? days.join(', ') : '';
        }
    },
    {
        field: 'start_time',
        headerName: 'Time',
        flex: 1,
        minWidth: 150,
        valueGetter: (value, row) => {
            const start = value || '';
            const end = row?.end_time || '';
            const formatTime = (timeStr) => {
                if (!timeStr) return '';
                return String(timeStr).split(':').slice(0, 2).join(':');
            };
            return start && end ? `${formatTime(start)} - ${formatTime(end)}` : '';
        }
    },
    {
        field: 'allow_cross_midnight',
        headerName: 'Cross Midnight',
        flex: 1,
        minWidth: 120,
        renderCell: (params) => params.row?.allow_cross_midnight ? 'Yes' : 'No'
    },
    {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        width: 120,
        renderCell: (params) => (
            <>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        params.row.onEdit?.(params.row);
                    }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        params.row.onDelete?.(params.row.id);
                    }}
                >
                    <DeleteIcon fontSize="small" color="error" />
                </IconButton>
            </>
        ),
    },
];

const RulesManagement = ({ groupId, groupName }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(groupId ? { id: groupId, name: groupName } : null);
    const [loadingGroups, setLoadingGroups] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        group_id: groupId,
        rule_name: '',
        days: [],
        start_time: '',
        end_time: '',
        allow_cross_midnight: false
    });

    // Fetch rules when component mounts or groupId changes
    useEffect(() => {
        if (groupId) {
            fetchRules();
        }
    }, [groupId]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoadingGroups(true);
                const response = await getGroups();
                setGroups(response.data || []);
            } catch (error) {
                console.error('Error fetching groups:', error);
                showError('Failed to load groups');
            } finally {
                setLoadingGroups(false);
            }
        };
        fetchRules();
        fetchGroups();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const response = await getRules(groupId);
            console.log(response);
            setRules(response.data || []);
        } catch (error) {
            showError('Failed to fetch rules');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDaysChange = (e) => {
        setFormData(prev => ({
            ...prev,
            days: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGroup) {
            showError('Please select a group');
            return;
        }

        setSubmitting(true);

        try {
            const formatTimeForBackend = (timeStr) => {
                if (!timeStr) return '';
                // Ensure the time is in HH:MM format
                const [hours, minutes] = timeStr.split(':');
                return `${hours.padStart(2, '0')}:${minutes || '00'}`;
            };

            const ruleData = {
                ...formData,
                group_id: selectedGroup.id,
                start_time: formatTimeForBackend(formData.start_time),
                end_time: formatTimeForBackend(formData.end_time),
                // Remove id for new records
                ...(editing ? {} : { id: undefined })
            };

            if (editing) {
                await updateRule(formData.id, ruleData);
                showSuccess('Rule updated successfully');
            } else {
                await createRule(ruleData);
                showSuccess('Rule created successfully');
            }

            setOpen(false);
            fetchRules();
            resetForm();
        } catch (error) {
            console.error('Error:', error);
            showError(`Failed to ${editing ? 'update' : 'create'} rule: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (rule) => {
        setFormData({
            id: rule.id,
            group_id: rule.group_id,
            rule_name: rule.rule_name,
            days: [...rule.days],
            start_time: rule.start_time,
            end_time: rule.end_time,
            allow_cross_midnight: rule.allow_cross_midnight || false
        });
        setEditing(true);
        setOpen(true);
    };

    const handleDelete = (ruleId) => {
        if (window.confirm('Are you sure you want to delete this rule?')) {
            confirmDelete(ruleId);
        }
    };

    const confirmDelete = async (ruleId) => {
        try {
            await deleteRule(ruleId);
            showSuccess('Rule deleted successfully');
            fetchRules();
        } catch (error) {
            showError('Failed to delete rule');
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            group_id: groupId,
            rule_name: '',
            days: [],
            start_time: '',
            end_time: '',
            allow_cross_midnight: false
        });
        setEditing(false);
    };

    const showSuccess = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'success'
        });
    };

    const showError = (message) => {
        setSnackbar({
            open: true,
            message,
            severity: 'error'
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    const rows = rules.map(rule => ({
        ...rule,
        onEdit: handleEdit,
        onDelete: handleDelete
    }));

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" my={3}>
                <Typography variant="h5" component="h2">
                    Rules for {groupName}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    size="small"
                >
                    Add Rule
                </Button>
            </Box>

            <div style={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    loading={loading}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    disableRowSelectionOnClick
                    disableSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'inherit !important',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0,0,0,0.02)', // optional hover style
                        },
                    }}
                />
            </div>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editing ? 'Edit Rule' : 'Add New Rule'}
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <TextField
                                fullWidth
                                label="Rule Name"
                                name="rule_name"
                                value={formData.rule_name}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                variant="outlined"
                                size="small"
                            />

                            <Autocomplete
                                options={groups}
                                getOptionLabel={(option) => option.group_name}
                                value={selectedGroup}
                                onChange={(_, newValue) => {
                                    setSelectedGroup(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Group"
                                        required
                                        margin="normal"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                )}
                                loading={loadingGroups}
                                disabled={!!groupId} // Changed from initialGroupId to groupId
                            />

                            <FormControl fullWidth margin="normal" size="small">
                                <InputLabel id="days-label">Days *</InputLabel>
                                <Select
                                    labelId="days-label"
                                    id="days"
                                    multiple
                                    value={formData.days}
                                    onChange={handleDaysChange}
                                    label="Days"
                                    required
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <span key={value} style={{
                                                    backgroundColor: '#e0e0e0',
                                                    borderRadius: '4px',
                                                    padding: '2px 6px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {value}
                                                </span>
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {days.map((day) => (
                                        <MenuItem key={day.value} value={day.value}>
                                            <Checkbox checked={formData.days.indexOf(day.value) > -1} />
                                            {day.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Start Time"
                                type="time"
                                name="start_time"
                                value={formData.start_time}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                            />

                            <TextField
                                fullWidth
                                label="End Time"
                                type="time"
                                name="end_time"
                                value={formData.end_time}
                                onChange={handleInputChange}
                                required
                                margin="normal"
                                variant="outlined"
                                size="small"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    step: 300, // 5 min
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.allow_cross_midnight}
                                        onChange={handleInputChange}
                                        name="allow_cross_midnight"
                                        color="primary"
                                    />
                                }
                                label="Allow cross midnight"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RulesManagement;