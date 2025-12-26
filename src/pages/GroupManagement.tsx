import { Layout } from "@/components/Layout"
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import AddIcon from '@mui/icons-material/Add';
import { useForm } from "react-hook-form";
import { DeleteIcon, EditIcon } from "lucide-react";
import { type Group, createGroup, createGroupUsers, deleteGroupByUser, getGroups, removeGroupMember, updateGroup } from "@/api/groupApi";
import { useNotification } from "@/context/NotificationContext";
import useGroups from "@/hooks/useGroups";
import GroupManagementModal from "@/components/innercomponent/GroupManagementModal";
import { useDevices } from "@/hooks/use-devices";
import { getSpecificGroupMembers } from "@/api/memberApi";
import { IoCloseCircle } from "react-icons/io5";
import { getAllUsers } from "@/api/usersApi";
import UsersManagementModal from "@/components/innercomponent/UsersManagementModal";

interface User {
    id: string;
    groups?: Array<{ group_id: string }>;
    // Add other user properties as needed
}

interface UserGroupFormValues {
    group_ids: string[]; // or number[] depending on your ID type
}

const GroupManagement = () => {
    const { groups, refetchGroups } = useGroups();
    const [showGroupTable, setShowGroupTable] = useState(true);
    const [viewMemberTable, setViewMemberTable] = useState(false);
    const [members, setMembers] = useState([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [usersManagementModalOpen, setUsersManagementModalOpen] = useState(false);

    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [groupDialog, setGroupDialog] = useState(false);
    const [getGroupID, setGetGroupID] = useState(null);
    const { showNotification } = useNotification();
    const { devices = [] } = useDevices();
    const [userPagination, setUserPagination] = useState({
        page: 1,
        limit: 10,
        count: 0
    });

    interface DeviceOption {
        id: string | number;
        device_id: string | number;
        group_id?: string | number;
        device_name: string;
        sn: string;
        group_name?: string;
        [key: string]: any;
    }

    const [deviceOptions, setDeviceOptions] = useState<DeviceOption[]>([]);
    const [getAllUserData, setGetAllUserData] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [deviceLoading, setDeviceLoading] = useState(false);
    const [deviceSearch, setDeviceSearch] = useState('');
    const [_, setDeviceHasMore] = useState(true);
    const [devicePage, setDevicePage] = useState(1);
    

    // Initial fetch when component mounts
    useEffect(() => {
        fetchDevicesPaginated({ page: 1, search: deviceSearch });
    }, []);

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

    const {
        register: registerUser,
        control: controlUser,
        handleSubmit: handleSubmitUser,
        reset: resetUser,
    } = useForm<UserGroupFormValues>({
        defaultValues: {
            group_ids: [],
        }
    });

    useEffect(() => {
        fetchAllUsers({ page: 1, limit: 10 });
    }, [userPagination.page, userPagination.limit]);

    useEffect(() => {

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

    const openEditGroup = (group: any) => {  // Using 'any' temporarily
        setEditingGroup(group);
        resetGroup({
            group_name: group.groupName || group.group_name,  // Handle both cases
            description: group.description,
            device_id: group.devices?.[0]?.device_id || "",
            is_active: group.isActive ?? group.is_active ?? true
        });
        setGroupDialog(true);
    };

    const handleDeleteGroup = async (id: string) => {
        try {
            // await deleteGroup(id)
            showNotification('Group deleted successfully', 'success');
            // fetchGroups();
        } catch (error) {
            showNotification('Failed to delete group', 'error');
        }
    }

    const saveGroup = async (formData: { group_name: string; description: string; device_id: string; is_active: boolean }) => {
        try {
            // Convert form data to API format
            const apiData = {
                groupName: formData.group_name,
                description: formData.description,
                device_id: formData.device_id,
                is_active: formData.is_active
            };

            if (editingGroup) {
                await updateGroup(editingGroup.id, apiData);
                showNotification('Group updated successfully', 'success');
            } else {
                await createGroup(apiData);
                showNotification('Group created successfully', 'success');
            }
            setGroupDialog(false);
            refetchGroups();
        } catch (error) {
            showNotification('Failed to save group', 'error');
        }
    };

    const fetchMembers = async (groupID: string) => {
        try {
            const res = await getSpecificGroupMembers(groupID);
            setMembers(res.data?.data || []);
        } catch (error) {
            const axiosError = error as {
                response?: {
                    data?: {
                        message?: string
                    },
                    status?: number
                }
            };
            const errorMessage = axiosError?.response?.data?.message || 'Failed to load group members';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (axiosError?.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }

            // Return empty array to prevent undefined errors
            return [];
        }
    };

    const fetchAllUsers = async ({ page = 1, limit = 10 }: { page?: number, limit?: number }) => {
        try {
            const res = await getAllUsers(`/with-group`);
            console.log(res);
            
            setUserPagination({
                page: res.pagination?.page,
                limit: res.pagination?.limit,
                count: res.pagination?.total
            })
            
            setGetAllUserData(res.data);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to load users';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
    }

    const openEditUser = (user: any) => {
        setEditingUser(user);

        // Convert user's groups → matching device options
        const selectedDevices = deviceOptions.filter((opt: any) =>
            user.groups?.some((g: any) => g.group_id === opt.group_id)
        );

        resetUser({
            group_ids: selectedDevices.map((opt: any) => opt.group_id), 
        });

        setUsersManagementModalOpen(true);
    };

    const handleDeleteGroupByUser = async (groupId: string) => {
        try {
            await deleteGroupByUser(groupId);
            showNotification("Group removed from user", "success");

            // REFETCH USERS
            fetchAllUsers({ page: userPagination.page, limit: userPagination.limit });
        } catch (e) {
            showNotification("Failed to remove group", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this member from the group?')) {
            try {
                await removeGroupMember(id);
                showNotification('Member removed successfully', 'success');
                fetchMembers(getGroupID ? getGroupID : '');
            } catch (error) {
                showNotification('Failed to remove member', 'error');
            }
        }
    };

    const handleUserSubmit = async (data: any) => {
        try {
            await createGroupUsers({
                ...data,
                user_id: editingUser?.id,
            });

            showNotification("User groups updated", "success");

            await fetchAllUsers({page: userPagination.page, limit: userPagination.limit}); // refresh table
            setUsersManagementModalOpen(false);

            resetUser({ group_ids: [] });
        } catch (error) {
            showNotification("Failed to update user groups", "error");
        }
    };

    interface ValueType {
        groups?: Group[];
    }

    interface FetchDevicesParams {
        page?: number;
        search?: string;
        value?: ValueType;
    }



    const fetchDevicesPaginated = async ({ page = 1, search = "", value }: FetchDevicesParams = {}) => {

        setDeviceLoading(true);

        try {
            const res = await getGroups({ page, limit: 20, search });
            const groups = res.data?.data || [];

            // ✅ group_ids from selected user
            const allowedGroupIds = value?.groups?.map((g: any) => g.common_group) || [];

            // ✅ Flatten devices
            let flattened = groups.flatMap((group: any) =>
                (group.devices || []).map((device: any) => ({
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
                flattened = flattened.filter((d: any) =>
                    !allowedGroupIds.some(id => id === d.group_id)
                );
            }

            setDeviceOptions((prev: any[]) => {
                const map = new Map();
                [...(page === 1 ? [] : prev), ...flattened].forEach(item => {
                    map.set(item.device_id, item); // ✅ dedupe by device
                });
                return Array.from(map.values());
            });

            setDevicePage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setDeviceLoading(false);
        }
    };

    const groupColumns = [
        {
            field: "group_name",
            headerName: "Group Name",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const sn = params.row.devices?.[0]?.sn || "No SN";
                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{params.value} - <strong>{sn}</strong></span>
                    </div>
                );
            }
        },
        { field: "description", headerName: "Description", flex: 1 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <IconButton onClick={() => openEditGroup(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>

                    <IconButton onClick={() => alert("delete")}>
                        <DeleteIcon color="error" onClick={() => handleDeleteGroup(params.row?.id)} />
                    </IconButton>

                    <Button size="small" variant='contained' color='success' onClick={() => {
                        setViewMemberTable(true); setGetGroupID(params.row.id);
                        fetchMembers(params.row.id);
                    }}>
                        View
                    </Button>
                </>
            )
        }
    ];

    const memberColumns = [
        {
            field: "group_name", headerName: "Group", flex: 1, renderCell: (params: GridRenderCellParams) => {
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

            renderCell: (params: GridRenderCellParams) => (
                params.value ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Allowed</span>) : (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Blocked</span>
                )
            )
        },
    ]

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
            renderCell: (params: GridRenderCellParams) => {
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
                        {params.row.groups.map((val: any, index: number) => (
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
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <IconButton onClick={() => { openEditUser(params.row); setEditUser(params.row) }}>
                        <EditIcon color="blue" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="red" />
                    </IconButton>
                </>
            )
        }
    ]

    return (
        <Layout>
            <div className="flex justify-between">
                <h3> Group Management</h3>
                {!viewMemberTable ? <div style={{ border: "1px solid #ccc" }}>
                    <Button variant={showGroupTable ? "contained" : "outlined"} onClick={() => setShowGroupTable(!showGroupTable)} >Group</Button>
                    <Button variant={!showGroupTable ? "contained" : "text"} onClick={() => setShowGroupTable(!showGroupTable)}>Users</Button>
                </div> : <Button variant='outlined' onClick={() => setViewMemberTable(false)} style={{ display: 'flex', alignItems: "center", gap: 2 }}><FaArrowLeftLong /> Go to main</Button>}
            </div>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                {
                    showGroupTable && !viewMemberTable && (
                        <Button variant="contained" sx={{ height: "40px" }} startIcon={<AddIcon />} onClick={openAddGroup}>
                            Add Group
                        </Button>
                    )
                }
            </Box>

            {!viewMemberTable && (showGroupTable ? (
                <DataGrid
                    rows={Array.isArray(groups) ? groups : groups?.data?.data || []}
                    columns={groupColumns}
                    getRowId={(r) => r.id}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationModel={{
                        pageSize: 10,
                        page: 0
                    }}
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
                    rows={getAllUserData || []}
                    columns={usersColumn}
                    getRowId={(r) => r.id}
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationModel={{
                        pageSize: 10,
                        page: 0
                    }}
                    onPaginationModelChange={(model) => {
                        const newPage = model.page + 1; // Convert to 1-based for API
                        fetchAllUsers({ page: newPage, limit: model.pageSize });
                    }}
                    autoHeight
                    getRowHeight={() => 'auto'}
                    disableRowSelectionOnClick
                    // Pagination props
                    pagination
                    rowCount={userPagination.count}
                    // page={userPagination.page - 1}
                    // pageSize={userPagination.limit}
                    sx={{
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        }
                    }}
                />
            ))}

            {viewMemberTable && <DataGrid
                rows={members}
                columns={memberColumns}
                getRowId={(r) => r.id}
                autoHeight
                pageSizeOptions={[10, 25, 50, 100]}
                paginationModel={{
                    pageSize: 10,
                    page: 0
                }}
                disableRowSelectionOnClick
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


            {/* modals */}
            <GroupManagementModal
                open={groupDialog}
                onClose={() => setGroupDialog(false)}
                editingGroup={!!editingGroup}
                devices={devices}
                controlGroup={controlGroup}
                registerGroup={registerGroup}
                groupErrors={groupErrors}
                handleSubmitGroup={handleSubmitGroup}
                saveGroup={saveGroup}
            />

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
                deviceSearch={deviceSearch}
            />
        </Layout >
    )
}

export default GroupManagement