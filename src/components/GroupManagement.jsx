import { useState, useEffect } from 'react';
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
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useNotification } from '../contexts/NotificationContext';
import {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup
} from '../api/groupApi';
import { getAllDevices } from '../api/handpassApi';
import { addGroupMember, getGroupMembers, getSpecifiGroupMembers, removeGroupMember, updateGroupMember } from '../api/memberApi';

import { useForm, Controller, set } from 'react-hook-form';
import { getAllUsers } from '../api/usersApi';

const GroupManagement = () => {

    // ======= STATES =======
    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [devices, setDevices] = useState([]);
    const [getAllUserData, setGetAllUserData] = useState([]);
    const [getGroupID, setGetGroupID] = useState(null);

    const [loading, setLoading] = useState(false);

    const [showGroupTable, setShowGroupTable] = useState(true);

    const [groupDialog, setGroupDialog] = useState(false);
    const [memberDialog, setMemberDialog] = useState(false);

    const [editingGroup, setEditingGroup] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const { showNotification } = useNotification();


    // ===== FORM A: GROUP FORM =====
    const {
        register: registerGroup,
        handleSubmit: handleSubmitGroup,
        reset: resetGroup,
        control: controlGroup,
        formState: { errors: groupErrors }
    } = useForm({
        defaultValues: {
            group_name: "",
            description: "",
            device_id: "",
            is_active: true
        }
    });

    // ===== FORM B: MEMBER FORM =====
    const {
        register: registerMember,
        handleSubmit: handleSubmitMember,
        reset: resetMember,
        formState: { errors: memberErrors },
        watch: memberWatch,
        control: controlMember,
    } = useForm({
        defaultValues: {
            group_id: "",
            user_id: "",
            is_allowed: true
        }
    });


    // ===== FETCH DATA =====
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await getGroups();
            setGroups(res.data || []);
        } catch {
            showNotification("Failed to load groups", "error");
        }
        setLoading(false);
    };

    const fetchMembers = async (groupID) => {
        try {
            const res = await getSpecifiGroupMembers(groupID);
            setMembers(res.data || []);
        } catch {
            showNotification("Failed to load members", "error");
        }
    };

    const fetchDevices = async () => {
        try {
            const res = await getAllDevices();
            setDevices(res.data);
        } catch {
            showNotification("Failed to load devices", "error");
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await getAllUsers();
            setGetAllUserData(res.data);
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        fetchGroups();
        fetchDevices();
        fetchAllUsers();
    }, []);


    // =======================
    //   GROUP CRUD HANDLERS
    // =======================

    const openAddGroup = () => {
        resetGroup({
            group_name: "",
            description: "",
            device_id: "",
            is_active: true
        });
        setEditingGroup(null);
        setGroupDialog(true);
    };

    const openEditGroup = (group) => {
        setEditingGroup(group);
        resetGroup({
            group_name: group.group_name,
            description: group.description,
            device_id: group.devices?.[0]?.device_id || "",
            is_active: group.is_active
        });
        setGroupDialog(true);
    };

    const saveGroup = async (data) => {
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, data);
                showNotification("Group updated", "success");
            } else {
                await createGroup(data);
                showNotification("Group created", "success");
            }
            setGroupDialog(false);
            fetchGroups();
        } catch {
            showNotification("Failed to save group", "error");
        }
    };


    // ========================
    //  MEMBER CRUD HANDLERS
    // ========================

    const openAddGroupMember = () => {
        resetMember({
            group_id: "",
            user_id: "",
            is_allowed: true
        });
        setEditingMember(null);
        setMemberDialog(true);
    }

    const openEditMember = (member) => {
        console.log(member);

        setEditingMember(member);
        resetMember({
            group_id: String(member.group_id),
            user_id: String(member.user_id),
            is_allowed: member.is_allowed ? "true" : "false"
        });
        setMemberDialog(true);
    };

    const handleMemberSubmit = async (data) => {
        try {
            if (editingMember) {
                await updateGroupMember(editingMember.id, data);
                showNotification('Member updated successfully', 'success');
            } else {
                await addGroupMember(data);
                showNotification('Member added successfully', 'success');
            }
            setMemberDialog(false);
            fetchMembers(getGroupID);
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
                fetchMembers(getGroupID);
            } catch (error) {
                console.error('Error removing member:', error);
                showNotification('Failed to remove member', 'error');
            }
        }
    };

    // ====================
    // TABLE COLUMNS
    // ====================

    const groupColumns = [
        {
            field: "group_name",
            headerName: "Group Name",
            flex: 1,
            renderCell: (params) => {
                const sn = params.row.devices?.[0]?.sn || "";
                return (
                    <div>
                        <strong>{params.value}</strong>
                        <div style={{ fontSize: 12, color: "#666" }}>
                            {sn && `( ${sn} )`}
                        </div>
                    </div>
                );
            }
        },
        { field: "description", headerName: "Description", flex: 2 },
        {
            field: "actions",
            headerName: "Actions",
            width: 190,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => openEditGroup(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>

                    <IconButton onClick={() => alert("delete")}>
                        <DeleteIcon color="error" />
                    </IconButton>

                    <Button size="small" variant='contained' color='success' onClick={() => { setShowGroupTable(false); setGetGroupID(params.row.id); fetchMembers(params.row.id); }}>
                        + Add
                    </Button>
                </>
            )
        }
    ];

    const memberColumns = [
        { field: "group_name", headerName: "Group", flex: 1 },
        { field: "name", headerName: "User", flex: 1 },
        {
            field: "is_allowed", headerName: "Status", flex: 1,

            renderCell: (params) => (
                params.value ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Allowed</span>) : (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Blocked</span>
                )
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => openEditMember(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </>
            )
        }
    ];


    return (
        <Box sx={{ p: 2 }}>

            {/* ============ HEADER ============ */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <h2>{showGroupTable ? "Group Management" : "Group Member Management"}</h2>

                {showGroupTable ? (
                    <Button variant="contained" sx={{ height: "40px" }} startIcon={<AddIcon />} onClick={openAddGroup}>
                        Add Group
                    </Button>
                ) :
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ height: "40px" }}
                        onClick={openAddGroupMember}
                    >
                        Add Member
                    </Button>
                }
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                {!showGroupTable && (
                    <Button variant="outlined" onClick={() => setShowGroupTable(true)}>Back</Button>
                )}
                {/* <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchGroups}>
                    Refresh
                </Button> */}
            </Box>


            {/* ============ TABLES ============ */}

            {showGroupTable ? (
                <DataGrid rows={groups} columns={groupColumns} getRowId={(r) => r.id} autoHeight />
            ) : (
                <DataGrid rows={members} columns={memberColumns} getRowId={(r) => r.id} autoHeight />
            )}


            {/* ======================================================
                     GROUP FORM DIALOG
            ====================================================== */}
            <Dialog open={groupDialog} onClose={() => setGroupDialog(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmitGroup(saveGroup)}>
                    <DialogTitle>{editingGroup ? "Edit Group" : "Add Group"}</DialogTitle>

                    <DialogContent>

                        <TextField
                            label="Group Name"
                            {...registerGroup("group_name")}
                            error={!!groupErrors.group_name}
                            helperText={groupErrors.group_name?.message}
                            fullWidth
                            margin="dense"
                        />

                        {/* Device Select */}
                        <Controller
                            name="device_id"
                            control={controlGroup}
                            render={({ field }) => {
                                const selected = devices.find(d => d.id === field.value) || null;

                                return (
                                    <Autocomplete
                                        options={devices}
                                        value={selected}
                                        getOptionLabel={(opt) => opt.sn || ""}
                                        isOptionEqualToValue={(a, b) => a.id === b?.id}
                                        onChange={(e, val) => field.onChange(val?.id || "")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Device"
                                                fullWidth
                                                margin="dense"
                                            />
                                        )}
                                    />
                                );
                            }}
                        />

                        <TextField
                            label="Description"
                            {...registerGroup("description")}
                            error={!!groupErrors.description}
                            helperText={groupErrors.description?.message}
                            fullWidth
                            multiline
                            rows={3}
                            margin="dense"
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button variant='outlined' onClick={() => setGroupDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>


            {/* ======================================================
                     MEMBER FORM DIALOG
            ====================================================== */}
            <Dialog open={memberDialog} onClose={() => { setMemberDialog(false); resetMember(); setEditingMember(null) }} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmitMember(handleMemberSubmit)}>
                    <DialogTitle>Edit Member</DialogTitle>

                    <DialogContent>

                        <Controller
                            name="group_id"
                            control={controlMember}
                            render={({ field }) => {
                                const selectedGroup =
                                    groups.find((g) => g.id === field.value) || null;

                                return (
                                    <Autocomplete
                                        options={groups}
                                        value={selectedGroup}
                                        getOptionLabel={(option) => option.group_name || ""}
                                        isOptionEqualToValue={(a, b) => a.id === b?.id}
                                        onChange={(event, value) => field.onChange(value?.id || "")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Group"
                                                margin="dense"
                                                fullWidth
                                            />
                                        )}
                                    />
                                );
                            }}
                        />

                        <Controller
                            name="user_id"
                            control={controlMember}
                            render={({ field }) => {
                                const selectedUser =
                                    getAllUserData.find((u) => u.id === field.value) || null;

                                return (
                                    <Autocomplete
                                        options={getAllUserData}
                                        value={selectedUser}
                                        getOptionLabel={(option) =>
                                            option ? `${option.name} (${option.user_id})` : ""
                                        }
                                        isOptionEqualToValue={(a, b) => a.id === b?.id}
                                        onChange={(event, value) => field.onChange(value?.id || "")}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select User"
                                                margin="dense"
                                                fullWidth
                                            />
                                        )}
                                    />
                                );
                            }}
                        />

                        <Select
                            {...registerMember("is_allowed")}
                            label="Status"
                            value={memberWatch("is_allowed") || "true"}
                            sx={{ width: "200px" }}
                        >
                            <MenuItem value="true">Allowed</MenuItem>
                            <MenuItem value="false">Blocked</MenuItem>
                        </Select>


                    </DialogContent>

                    <DialogActions>
                        <Button variant='outlined' onClick={() => setMemberDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </Box>
    );
};

export default GroupManagement;
