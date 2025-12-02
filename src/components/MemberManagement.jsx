import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getGroupMembers,
    addGroupMember,
    updateGroupMember,
    removeGroupMember
} from '../api/memberApi';
import { getGroups } from '../api/groupApi';

const memberSchema = yup.object().shape({
    group_id: yup.string().required('Group is required'),
    user_id: yup.string().required('User ID is required'),
    is_allowed: yup.boolean().default(true)
});

const MemberManagement = () => {
    const [members, setMembers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const { showNotification } = useNotification();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(memberSchema),
        defaultValues: {
            group_id: '',
            user_id: '',
            is_allowed: true
        }
    });

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await getGroupMembers();
            setMembers(response.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            showNotification('Failed to load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupsList = async () => {
        try {
            const response = await getGroups();
            setGroups(response.data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
            showNotification('Failed to load groups', 'error');
        }
    };

    useEffect(() => {
        fetchMembers();
        fetchGroupsList();
    }, []);

    const onSubmit = async (data) => {
        const customData = {
            ...data,
            user_id: "4ea216ef-d327-47c0-86bc-aebae7fa2e9b"
        };
        try {
            if (editingMember) {
                await updateGroupMember(editingMember.id, customData);
                showNotification('Member updated successfully', 'success');
            } else {
                await addGroupMember(customData);
                showNotification('Member added successfully', 'success');
            }
            handleCloseDialog();
            fetchMembers();
        } catch (error) {
            console.error('Error saving member:', error);
            showNotification(`Failed to ${editingMember ? 'update' : 'add'} member`, 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this member from the group?')) {
            try {
                await removeGroupMember(id);
                showNotification('Member removed successfully', 'success');
                fetchMembers();
            } catch (error) {
                console.error('Error removing member:', error);
                showNotification('Failed to remove member', 'error');
            }
        }
    };

    const handleEdit = (member) => {
        setEditingMember(member);
        reset({
            group_id: member.group_id,
            user_id: member.user_id,
            is_allowed: member.is_allowed
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingMember(null);
        reset();
    };

    const columns = [
        {
            field: 'group_name',
            headerName: 'Group Name',
            flex: 1,
            minWidth: 200,
            // valueGetter: (params) => {
            //     if (!groups || !params.row) return 'Loading...';
            //     const group = groups.find(g => g && g.id === params.row.group_id);
            //     return group ? group.group_name : 'N/A';
            // }
        },
        {
            field: 'user_name',
            headerName: 'User',
            flex: 1,
            minWidth: 250
        },
        {
            field: 'is_allowed',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Box
                    sx={{
                        color: params.value ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                    }}
                >
                    {params.value ? 'Allowed' : 'Blocked'}
                </Box>
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: (params) => [
                <Tooltip title="Edit" key="edit">
                    <IconButton onClick={() => handleEdit(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>
                </Tooltip>,
                <Tooltip title="Remove" key="delete">
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </Tooltip>
            ]
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%', p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <h2>Member Management</h2>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Member
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchMembers}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                    rows={members}
                    columns={columns}
                    loading={loading}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    getRowId={(row) => row.id}
                    disableColumnMenu
                    disableExtendRowFullWidth
                    autoHeight
                    scrollbarSize={0}
                    sx={{
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                        },
                        '& .MuiDataGrid-cell': {
                            borderRight: '1px solid #f0f0f0',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            overflow: 'hidden',
                        },
                        '& .MuiDataGrid-virtualScrollerContent': {
                            height: '100% !important',
                            maxHeight: 'none !important',
                        },
                        '& .MuiDataGrid-row, & .MuiDataGrid-cell': {
                            maxWidth: '100% !important',
                        },
                        '& .MuiDataGrid-main': {
                            position: 'relative',
                            overflow: 'hidden',
                        },
                    }}
                />
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{editingMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                    <DialogContent sx={{ pt: 2, '& > *': { mb: 3 } }}>
                        <FormControl fullWidth error={!!errors.group_id}>
                            <InputLabel id="group-select-label">Group</InputLabel>
                            <Select
                                labelId="group-select-label"
                                label="Group"
                                {...register('group_id')}
                                defaultValue=""
                            >
                                {groups.map((group) => (
                                    <MenuItem key={group.id} value={group.id}>
                                        {group.group_name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.group_id && (
                                <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem' }}>
                                    {errors.group_id.message}
                                </Box>
                            )}
                        </FormControl>

                        <TextField
                            fullWidth
                            label="User ID"
                            variant="outlined"
                            {...register('user_id')}
                            error={!!errors.user_id}
                            helperText={errors.user_id?.message}
                        />

                        <FormControl fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                label="Status"
                                {...register('is_allowed')}
                                defaultValue={true}
                            >
                                <MenuItem value={true}>Allowed</MenuItem>
                                <MenuItem value={false}>Blocked</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingMember ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default MemberManagement;