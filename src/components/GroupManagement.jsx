import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip
} from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api/groupApi';

// Form validation schema
const groupSchema = yup.object().shape({
    group_name: yup.string().required('Group name is required'),
    description: yup.string().required('Description is required'),
    is_active: yup.boolean().default(true)
});

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const { showNotification } = useNotification();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(groupSchema),
        defaultValues: {
            group_name: '',
            description: '',
            is_active: true
        }
    });

    // Fetch groups
    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await getGroups();
            setGroups(response.data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
            showNotification('Failed to load groups', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // Handle form submission
    const onSubmit = async (data) => {
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, { ...editingGroup, ...data });
                showNotification('Group updated successfully', 'success');
            } else {
                await createGroup(data);
                showNotification('Group created successfully', 'success');
            }
            handleCloseDialog();
            fetchGroups();
        } catch (error) {
            console.error('Error saving group:', error);
            showNotification(`Failed to ${editingGroup ? 'update' : 'create'} group`, 'error');
        }
    };

    // Handle delete group
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                await deleteGroup(id, true); // Hard delete
                showNotification('Group deleted successfully', 'success');
                fetchGroups();
            } catch (error) {
                console.error('Error deleting group:', error);
                showNotification('Failed to delete group', 'error');
            }
        }
    };

    // Handle edit group
    const handleEdit = (group) => {
        setEditingGroup(group);
        reset({
            group_name: group.group_name,
            description: group.description,
            is_active: group.is_active
        });
        setOpenDialog(true);
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingGroup(null);
        reset();
    };

    // Table columns
    const columns = [
        {
            field: 'group_name',
            headerName: 'Group Name',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 2,
            minWidth: 300
        },
        {
            field: 'is_active',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => (
                <Box
                    sx={{
                        color: params.value ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                    }}
                >
                    {params.value ? 'Active' : 'Inactive'}
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
                <Tooltip title="Delete" key="delete">
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </Tooltip>
            ]
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <h2>Group Management</h2>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Add Group
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchGroups}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ height: 'calc(100vh - 320px)', width: '100%' }}>
                <DataGrid
                    rows={groups}
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

            {/* Add/Edit Group Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
                    <DialogContent sx={{ pt: 2 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Group Name"
                            fullWidth
                            variant="outlined"
                            {...register('group_name')}
                            error={!!errors.group_name}
                            helperText={errors.group_name?.message}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingGroup ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default GroupManagement;