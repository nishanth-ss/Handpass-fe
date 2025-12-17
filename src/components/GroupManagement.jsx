import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    IconButton,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useNotification } from '../contexts/NotificationContext';
import {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    createGroupUsers,
    deleteGroupByUser,
} from '../api/groupApi';
import { getAllDevices } from '../api/handpassApi';
import { addGroupMember, getSpecifiGroupMembers, removeGroupMember, updateGroupMember } from '../api/memberApi';

import { useForm } from 'react-hook-form';
import { FaArrowLeftLong, FaCloudShowersHeavy } from "react-icons/fa6";
import { getAllUsers } from '../api/usersApi';
import MemberManagementModal from './innerComponents/groupmanagement/MemberManagementModal';
import GroupManagementModal from './innerComponents/groupmanagement/GroupManagementModal';
import UsersManagementModal from './innerComponents/groupmanagement/UserManagement';
import { IoCloseCircle } from "react-icons/io5";

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
    const [usersManagementModalOpen, setUsersManagementModalOpen] = useState(false);

    const [viewMemberTable, setViewMemberTable] = useState(false);

    const [editingGroup, setEditingGroup] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [deviceOptions, setDeviceOptions] = useState([]);
    const [devicePage, setDevicePage] = useState(1);
    const [deviceHasMore, setDeviceHasMore] = useState(true);
    const [deviceLoading, setDeviceLoading] = useState(false);
    const [deviceSearch, setDeviceSearch] = useState("");
    const [editUser, setEditUser] = useState(null);

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
            // group_id: "",
            user_id: "",
            is_allowed: true
        }
    });

    const {
        register: registerUser,
        control: controlUser,
        handleSubmit: handleSubmitUser,
        reset: resetUser,
    } = useForm({
        defaultValues: {
            group_ids: [],   // ✅ IMPORTANT
        }
    });

    // ===== FETCH DATA =====
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await getGroups();
            setGroups(res.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load groups';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                // The interceptor should handle this, but just in case
                // localStorage.removeItem('authToken');
                // window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (groupID) => {
        try {
            const res = await getSpecifiGroupMembers(groupID);
            setMembers(res.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load group members';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }

            // Return empty array to prevent undefined errors
            return [];
        }
    };

    const fetchDevicesPaginated = async ({ page = 1, search = "", value } = {}) => {

        setDeviceLoading(true);

        try {
            const res = await getGroups({ page, limit: 20, search });
            const groups = res.data || [];

            // ✅ group_ids from selected user
            const allowedGroupIds = value?.groups?.map(g => g.common_group) || [];

            // ✅ Flatten devices
            let flattened = groups.flatMap(group =>
                (group.devices || []).map(device => ({
                    id: device.device_id,
                    group_id: group.id,
                    device_id: device.device_id,
                    device_name: device.device_name,
                    sn: device.sn,
                    group_name: device.group_name
                }))
            );

            // ✅ FILTER by user's group_id
            if (allowedGroupIds.length > 0) {
                flattened = flattened.filter(d =>
                    !allowedGroupIds.some(id => id === d.group_id)
                );
            }

            setDeviceOptions(prev => {
                const map = new Map();
                [...(page === 1 ? [] : prev), ...flattened].forEach(item => {
                    map.set(item.device_id, item); // ✅ dedupe by device
                });
                return Array.from(map.values());
            });

            if (!res.pagination?.has_next) {
                setDeviceHasMore(false);
            }

            setDevicePage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setDeviceLoading(false);
        }
    };

    const fetchDevices = async () => {
        try {
            const res = await getAllDevices();
            setDevices(res.data || []);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load devices';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }

            // Return empty array to prevent undefined errors
            return [];
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await getAllUsers('/with-group');
            setGetAllUserData(res.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to load users';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
    }


    useEffect(() => {
        fetchGroups();
        fetchDevices();
        fetchAllUsers();
    }, []);

    useEffect(() => {
        // console.log("editUser",editUser);

        if (!editUser) return;

        // reset pagination when user changes
        setDevicePage(1);
        setDeviceHasMore(true);
        setDeviceOptions([]);

        fetchDevicesPaginated({
            page: 1,
            search: "",
            value: editUser
        });
    }, [editUser]);


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
            // group_id: "",
            user_id: "",
            is_allowed: true
        });
        setEditingMember(null);
        setMemberDialog(true);
    }

    const openEditMember = (member) => {
        setEditingMember(member);
        resetMember({
            // group_id: String(member.group_id),
            user_id: String(member.user_id),
            is_allowed: member.is_allowed ? "true" : "false"
        });
        setMemberDialog(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);

        // Convert user's groups → matching device options
        const selectedDevices = deviceOptions.filter(opt =>
            user.groups?.some(g => g.group_id === opt.group_id)
        );

        resetUser({
            group_ids: selectedDevices, // ✅ FULL OBJECTS
        });

        setUsersManagementModalOpen(true);
    };

    const handleMemberSubmit = async (data) => {
        try {
            if (editingMember) {
                await updateGroupMember(editingMember.id, { ...data, group_id: getGroupID });
                showNotification('Member updated successfully', 'success');
            } else {
                await addGroupMember({ ...data, group_id: getGroupID });
                showNotification('Member added successfully', 'success');
            }
            setMemberDialog(false);
            fetchMembers(getGroupID);
        } catch (error) {
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
                showNotification('Failed to remove member', 'error');
            }
        }
    };

    const handleDeleteGroup = async (id) => {
        try {
            await deleteGroup(id)
            showNotification('Group deleted successfully', 'success');
            fetchGroups();
        } catch (error) {
            showNotification('Failed to delete group', 'error');
        }
    }

    // ====================
    // TABLE COLUMNS
    // ====================

    const groupColumns = [
        {
            field: "group_name",
            headerName: "Group Name",
            flex: 1,
            renderCell: (params) => {
                const sn = params.row.devices?.[0]?.sn || "No SN";
                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{params.value} - <strong>{sn}</strong></span>
                    </div>
                );
            }
        },
        { field: "description", headerName: "Description", flex: 2 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => openEditGroup(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>

                    <IconButton onClick={() => alert("delete")}>
                        <DeleteIcon color="error" onClick={() => handleDeleteGroup(params.row?.id)} />
                    </IconButton>

                    <Button size="small" variant='contained' color='success' onClick={() => { setViewMemberTable(true); setGetGroupID(params.row.id); fetchMembers(params.row.id); }}>
                        View
                    </Button>
                </>
            )
        }
    ];

    const usersColumn = [
        {
            field: "name",
            headerName: "User Name",
            flex: 1,
        },
        {
            field: "role",
            headerName: "Role",
            flex: 1
        },
        {
            field: "group_id", headerName: "Group ID", flex: 1,
            renderCell: (params) => {
                if (!params.row.groups || params.row.groups.length === 0) {
                    return "-";
                }

                return (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                        }}
                    >
                        {params.row.groups.map((val, index) => (
                            <div key={val.group_id || index} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                {index + 1}. {val.group_name}
                                <span style={{ cursor: "pointer", color: "red" }}><IoCloseCircle onClick={() => handleDeleteGroupByUser(val.group_id)} /></span>
                            </div>
                        ))}
                    </div>
                );
            }
        },

        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => { openEditUser(params.row); setEditUser(params.row) }}>
                        <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </>
            )
        }
    ]

    const memberColumns = [
        {
            field: "group_name", headerName: "Group", flex: 1, renderCell: (params) => {
                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{params.value}</span>
                    </div>
                )
            }
        },
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
        // {
        //     field: "wiegand_flag",
        //     headerName: "Access Control Permission",
        //     flex:1,
        //     renderCell: (params) => {
        //         return (
        //             <Select
        //                 value={params.value}
        //                 onChange={(e) => {
        //                     const newValue = e.target.value;
        //                     updateWiegandFlag(params.row, newValue); 
        //                 }}
        //                 size="small"
        //                 sx={{
        //                     "& .MuiSelect-select": {
        //                         padding: "4px 8px",
        //                         fontSize: "14px",
        //                         color: params.value === 1 ? "green" : "#999",
        //                     },
        //                     "& .MuiOutlinedInput-notchedOutline": {
        //                         border: "none",
        //                     },
        //                     "&:hover .MuiOutlinedInput-notchedOutline": {
        //                         border: "1px solid #ddd",
        //                     },
        //                 }}
        //             >
        //                 <MenuItem value={1} sx={{ color: "green" }}>Yes</MenuItem>
        //                 <MenuItem value={0} sx={{ color: "#999" }}>No</MenuItem>
        //             </Select>
        //         );
        //     },
        // },
        // {
        //     field: "admin_auth", headerName: "Admin Permission",
        //     flex:1,
        //     renderCell: (params) => {
        //         return (
        //             <Select
        //                 value={params.value}
        //                 onChange={(e) => handleWiegandChange(params.row.id, e.target.value)}
        //                 size="small"
        //                 sx={{
        //                     '& .MuiSelect-select': {
        //                         padding: '4px 8px',
        //                         fontSize: '14px',
        //                         color: params.value === 1 ? 'green' : '#999'
        //                     },
        //                     '& .MuiOutlinedInput-notchedOutline': {
        //                         border: 'none'
        //                     },
        //                     '&:hover .MuiOutlinedInput-notchedOutline': {
        //                         border: '1px solid #ddd'
        //                     }
        //                 }}
        //             >
        //                 <MenuItem value={1} sx={{ color: 'green' }}>Yes</MenuItem>
        //                 <MenuItem value={0} sx={{ color: '#999' }}>No</MenuItem>
        //             </Select>
        //         )
        //     }
        // },
        // {
        //     field: "actions",
        //     headerName: "Actions",
        //     width: 150,
        //     renderCell: (params) => (
        //         <>
        //             <IconButton onClick={() => openEditMember(params.row)}>
        //                 <EditIcon color="primary" />
        //             </IconButton>
        //             <IconButton onClick={() => handleDelete(params.row.id)}>
        //                 <DeleteIcon color="error" />
        //             </IconButton>
        //         </>
        //     )
        // }
    ];

    const handleDeleteGroupByUser = async (groupId) => {
        try {
            await deleteGroupByUser(groupId);
            showNotification("Group removed from user", "success");

            // ✅ REFETCH USERS
            fetchAllUsers();
        } catch (e) {
            showNotification("Failed to remove group", "error");
        }
    };


    const handleUserSubmit = async (data) => {
        try {
            await createGroupUsers({
                ...data,
                user_id: editingUser.id,
            });

            showNotification("User groups updated", "success");

            await fetchAllUsers(); // ✅ refresh table
            setUsersManagementModalOpen(false);

            resetUser({ group_ids: "" });
        } catch (error) {
            showNotification("Failed to update user groups", "error");
        }
    };


    return (
        <Box sx={{ p: 2 }}>

            {/* ============ HEADER ============ */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <h2 style={{ margin: "0" }}>{showGroupTable ? "Group Management" : "Group Member Management"}</h2>

                {/* {showGroupTable ? (
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
                } */}
                {!viewMemberTable ? <div style={{ border: "1px solid #ccc" }}>
                    <Button variant={showGroupTable ? "contained" : "outlined"} onClick={() => setShowGroupTable(!showGroupTable)} >Group</Button>
                    <Button variant={!showGroupTable ? "contained" : "text"} onClick={() => setShowGroupTable(!showGroupTable)}>Users</Button>
                </div> : <Button variant='outlined' onClick={() => setViewMemberTable(false)} style={{ display: 'flex', alignItems: "center", gap: 2 }}><FaArrowLeftLong /> Go to main</Button>}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                {
                    showGroupTable && !viewMemberTable && (
                        <Button variant="contained" sx={{ height: "40px" }} startIcon={<AddIcon />} onClick={openAddGroup}>
                            Add Group
                        </Button>
                    )
                }
            </Box>


            {/* ============ TABLES ============ */}

            {!viewMemberTable && (showGroupTable ? (
                <DataGrid
                    rows={groups}
                    columns={groupColumns}
                    getRowId={(r) => r.id}
                    autoHeight
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
                />) : (

                <DataGrid
                    rows={getAllUserData}
                    columns={usersColumn}
                    getRowId={(r) => r.id}
                    autoHeight
                    getRowHeight={() => 'auto'}
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
                        "& .MuiDataGrid-cell": {
                            display: "flex",
                            alignItems: "center",   // 👈 vertical center for ALL cells
                        }
                    }}
                />
            ))}


            {/* ======================================================
                     GROUP FORM DIALOG
            ====================================================== */}
            <GroupManagementModal
                open={groupDialog}
                onClose={() => setGroupDialog(false)}
                editingGroup={editingGroup}
                devices={devices}
                controlGroup={controlGroup}
                registerGroup={registerGroup}
                groupErrors={groupErrors}
                handleSubmitGroup={handleSubmitGroup}
                saveGroup={saveGroup}
            />

            {/* ======================================================
                     MEMBER FORM DIALOG
            ====================================================== */}

            <UsersManagementModal
                open={usersManagementModalOpen}
                onClose={() => setUsersManagementModalOpen(false)}
                devices={devices}
                controlMember={controlUser}
                registerMember={registerUser}
                handleSubmitMember={handleSubmitUser}
                handleMemberSubmit={handleUserSubmit}
                deviceOptions={deviceOptions || []}
                deviceLoading={deviceLoading}
                setDeviceSearch={setDeviceSearch}
                setDeviceHasMore={setDeviceHasMore}
                fetchDevicesPaginated={fetchDevicesPaginated}
                devicePage={devicePage}
            />

            {viewMemberTable && <DataGrid rows={members} columns={memberColumns} getRowId={(r) => r.id} autoHeight
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
            />}
        </Box>
    );
};

export default GroupManagement;
