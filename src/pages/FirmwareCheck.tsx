import { Layout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FirmwareFormData {
  serialNumber: string;
  firmwareVersion: string;
}

const Firmware = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FirmwareFormData>();

  const onSubmit = (data: FirmwareFormData) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Firmware Check</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Device Serial Number</Label>
            <Input
              id="serialNumber"
              placeholder="Enter device serial number"
              {...register("serialNumber", {
                required: "Serial number is required",
              })}
              className={errors.serialNumber ? 'border-red-500' : ''}
            />
            {errors.serialNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.serialNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firmwareVersion">Current Firmware Version</Label>
            <Input
              id="firmwareVersion"
              placeholder="Enter current firmware version"
              {...register("firmwareVersion", {
                required: "Firmware version is required",
              })}
              className={errors.firmwareVersion ? 'border-red-500' : ''}
            />
            {errors.firmwareVersion && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firmwareVersion.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Check for Updates
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Firmware;