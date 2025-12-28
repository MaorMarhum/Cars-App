"use client";

import { useTransition, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getCarByPlate, addCar } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MANUFACTURERS } from "@/lib/data";
import { PlusCircle, Sparkles } from "lucide-react";
import GoBackButton from "@/components/ui/go-back-button"; // ✅

const schema = z.object({
  plate: z.string().min(6, "Plate number must have at least 6 digits"),
  manufacturer: z.string().min(1, "Please select a manufacturer"),
  model: z.string().min(1, "Please select a model"),
  year: z
    .string()
    .refine((val) => /^\d{4}$/.test(val), {
      message: "Enter a valid year (e.g. 2019)",
    }),
});

export default function AddCarPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      plate: "",
      manufacturer: "",
      model: "",
      year: "",
    },
  });

  const [isPending, startTransition] = useTransition();
  const [models, setModels] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateAvailablePlate() {
    setIsGenerating(true);
    try {
      let plate: string;
      let existing;

      do {
        plate = Math.floor(1000000 + Math.random() * 9000000).toString();
        existing = await getCarByPlate(plate);
      } while (existing);

      form.setValue("plate", plate);
      toast.success(`✅ Available plate generated: ${plate}`);
    } catch {
      toast.error("Failed to generate a plate number.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    startTransition(async () => {
      try {
        const existing = await getCarByPlate(values.plate);
        if (existing) {
          toast.error(`❌ Plate ${values.plate} already exists.`);
          return;
        }

        await addCar(values);
        toast.success("✅ Car added successfully!");
        form.reset();
        setModels([]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add car.";
        toast.error(`❌ Error: ${errorMessage}`);
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-200 mt-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add a New Car</h1>
        <p className="text-gray-500 text-sm">
          Fill in the details below to add your car to the system.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Plate + Generate */}
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Plate Number
                </FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="e.g. 1234567"
                      {...field}
                      className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-400"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateAvailablePlate}
                    disabled={isGenerating}
                    className="whitespace-nowrap"
                  >
                    {isGenerating ? "..." : "Generate"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Manufacturer */}
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Manufacturer
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setModels(MANUFACTURERS[value] || []);
                      form.setValue("model", "");
                    }}
                    value={field.value}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-blue-400">
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(MANUFACTURERS).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Model
                </FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={models.length === 0}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-blue-400">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Year */}
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">
                  Year
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g. 2020"
                    {...field}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2 text-white py-2.5"
          >
            {isPending ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5" /> Add Car
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* ✅ Go Back button */}
      <div className="flex justify-center mt-6">
        <GoBackButton />
      </div>
    </div>
  );
}
