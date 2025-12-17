import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import { Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const UsersManagementModal = ({
    open,
    onClose,
    devices,                 // 👈 pass devices here
    controlMember,
    handleSubmitMember,
    handleMemberSubmit,
    deviceOptions,
    deviceLoading,
    setDeviceSearch,
    setDeviceHasMore,
    fetchDevicesPaginated,
    devicePage,
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
                            <Autocomplete
                                multiple
                                options={deviceOptions}
                                loading={deviceLoading}

                                isOptionEqualToValue={(o, v) => o.group_id === v.group_id}

                                value={deviceOptions.filter(opt =>
                                    field.value?.includes(opt.group_id)
                                )}

                                getOptionLabel={(option) =>
                                    `${option.sn}${option.device_name ? " - " + option.device_name : " - " +  option.group_name}`
                                }

                                onChange={(e, value) =>
                                    field.onChange(value.map(v => v.group_id))
                                }

                                onInputChange={(e, value) => {
                                    setDeviceSearch(value);
                                    setDeviceHasMore(true);
                                    fetchDevicesPaginated({ page: 1, search: value });
                                }}

                                ListboxProps={{
                                    onScroll: (event) => {
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

                                disableCloseOnSelect   // ✅ keep dropdown open

                                renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option.group_id}>
                                        <Checkbox
                                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                            checkedIcon={<CheckBoxIcon fontSize="small" />}
                                            checked={selected}   // ✅ automatically true if selected
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
