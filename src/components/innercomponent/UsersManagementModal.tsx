import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Checkbox,
} from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import type { SyntheticEvent } from 'react';

interface DeviceOption {
    id: string | number;
    device_id: string | number;
    group_id?: string | number;
    device_name: string;
    sn: string;
    group_name?: string;
    [key: string]: any;
}

interface UserGroupFormValues {
    group_ids: string[]; // or number[] depending on your ID type
}
interface UsersManagementModalProps {
    open: boolean;
    onClose: () => void;
    devices: any[];
    controlMember: Control<UserGroupFormValues>;
    registerMember: UseFormRegister<UserGroupFormValues>;
    handleSubmitMember: UseFormHandleSubmit<UserGroupFormValues>;
    handleMemberSubmit: (data: UserGroupFormValues) => void;
    deviceOptions: DeviceOption[];
    deviceLoading: boolean;
    setDeviceSearch: (search: string) => void;
    setDeviceHasMore: (hasMore: boolean) => void;
    fetchDevicesPaginated: (params: { page: number; search: string }) => void;
    devicePage: number;
    deviceSearch: string;
}

const UsersManagementModal: React.FC<UsersManagementModalProps> = ({
    open,
    onClose,
    devices,
    controlMember,
    handleSubmitMember,
    handleMemberSubmit,
    deviceOptions,
    deviceLoading,
    setDeviceSearch,
    setDeviceHasMore,
    fetchDevicesPaginated,
    devicePage,
    deviceSearch,
    registerMember
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmitMember(handleMemberSubmit)}>
                <DialogTitle>Assign Devices</DialogTitle>

                <DialogContent>
                    {/* Device Multi Selector */}
                    <Controller
                        name="group_ids"
                        control={controlMember}
                        render={({ field }) => (
                            <Autocomplete<DeviceOption, true, false, false>
                                multiple
                                options={deviceOptions}
                                loading={deviceLoading}
                                isOptionEqualToValue={(option, value) =>
                                    option.group_id === value.group_id
                                }
                                value={deviceOptions.filter((opt: any) =>
                                    field.value?.includes(opt.group_id)
                                )}
                                getOptionLabel={(option) =>
                                    `${option.sn}${option.device_name ? " - " + option.device_name : " - " + option.group_name}`
                                }
                                onChange={(e: SyntheticEvent, value: DeviceOption[]) =>
                                    field.onChange(value.map(v => v.group_id))
                                }
                                onInputChange={(e, value) => {
                                    setDeviceSearch(value);
                                    setDeviceHasMore(true);
                                    fetchDevicesPaginated({ page: 1, search: value });
                                }}
                                ListboxProps={{
                                    onScroll: (event: React.UIEvent<HTMLElement>) => {
                                        const listboxNode = event.currentTarget;
                                        if (
                                            listboxNode.scrollTop + listboxNode.clientHeight >=
                                            listboxNode.scrollHeight - 10
                                        ) {
                                            fetchDevicesPaginated({
                                                page: devicePage + 1,
                                                search: deviceSearch,
                                            });
                                        }
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: 'none', // Remove border on focus
                                            boxShadow: 'none', // Remove any box shadow
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            border: '1px solid #ccc', // Optional: Custom hover state
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: '1px solid #ccc', // Default border
                                        },
                                    },
                                }}
                                disableCloseOnSelect
                                renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option.group_id}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                            checked={selected}
                                            sx={{ mr: 1 }}
                                        />
                                        {option.sn}
                                        {option.device_name ? ` - ${option.device_name}` : ` - ${option.group_name}`}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Select Devices"
                                        margin="dense"
                                        fullWidth
                                    />
                                )}
                            />
                        )}
                    />
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UsersManagementModal;