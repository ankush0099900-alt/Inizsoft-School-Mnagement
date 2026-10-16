"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useCreateSubscription, useUpdateSubscription, } from "../hooks/useSubscriptionMutation";
import { Subscription } from "../types/subscription";
import { subscriptionSchema, type SubscriptionFormValues, } from "../schemas/subscription.schema";
import { getPlans } from "../api/plans.api";
import { getSchools } from "../../schools/api/school.api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";

// props
interface SubscriptionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subscription?: Subscription;
    schoolId?: string;
}



export default function SubscriptionForm({ open, onOpenChange, subscription, schoolId, }: SubscriptionFormProps) {
    const createMutation = useCreateSubscription();
    const updateMutation = useUpdateSubscription();

    const {
        data: schoolsResponse,
    } = useQuery({
        queryKey: queryKeys.schools.list(1, 1000, ""),
        queryFn: () => getSchools(1, 1000, ""),
    });

    const schools = schoolsResponse?.schools ?? [];

    const {
        data: plans = [],
    } = useQuery({
        queryKey: queryKeys.plans.list(),
        queryFn: getPlans,
    });

    const form = useForm<SubscriptionFormValues>({
        resolver: zodResolver(subscriptionSchema,),
        defaultValues: {
            schoolId: schoolId ?? "",
            planId: "",
            startDate: "",
            endDate: "",
            status: "TRIAL",
            amount: 0,
            discount: 0,
            tax: 0,
            finalAmount: 0,
        },
        mode: "onChange",
    });

    // Edit Mode
    useEffect(() => {
        if (!subscription) {
            form.reset({
                schoolId: schoolId ?? "",
                planId: "",
                startDate: "",
                endDate: "",
                status: "TRIAL",
                amount: 0,
                discount: 0,
                tax: 0,
                finalAmount: 0,
            });
            return;
        }

        form.reset({
            schoolId: subscription.school?.id ?? subscription.schoolId,
            planId: subscription.plan?.id ?? subscription.planId,
            startDate: subscription.startDate.slice(0, 10),
            endDate: subscription.endDate.slice(0, 10),
            status: subscription.status,
            amount: subscription.amount,
            discount: subscription.discount,
            tax: subscription.tax,
            finalAmount: subscription.finalAmount,
        });
    }, [subscription, schoolId, form,]);

    // Auto Calculate Final Amount
    const amount = form.watch("amount"); const discount = form.watch("discount"); const tax = form.watch("tax");

    useEffect(() => {
        const finalAmount = Number(amount || 0) - Number(discount || 0) + Number(tax || 0);
        form.setValue("finalAmount", finalAmount, { shouldValidate: true, },);
    }, [amount, discount, tax, form,]);

    // Submit
    const onSubmit = async (
        values: SubscriptionFormValues,
    ) => {
        try {
            if (subscription) {
                await updateMutation.mutateAsync({
                    id: subscription.id,
                    payload: values,
                });
            } else {
                await createMutation.mutateAsync(
                    values,
                );
            }

            form.reset({
                schoolId: schoolId ?? "",
                planId: "",
                startDate: "",
                endDate: "",
                status: "TRIAL",
                amount: 0,
                discount: 0,
                tax: 0,
                finalAmount: 0,
            });

            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-2xl">

                <DialogHeader>
                    <DialogTitle>
                        {subscription
                            ? "Update Subscription"
                            : "Create Subscription"}
                    </DialogTitle>
                </DialogHeader>


                <Form {...form}>

                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            {!schoolId && (
                                <FormField
                                    control={form.control}
                                    name="schoolId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                School Name
                                            </FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select School" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectContent>
                                                        {schools.map((school) => (
                                                            <SelectItem key={school.id} value={school.id}>
                                                                {school.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="planId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Plan Name
                                        </FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Plan" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {plans.map((plan) => (
                                                    <SelectItem
                                                        key={plan.id}
                                                        value={plan.id}
                                                    >
                                                        {plan.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0}{...field}
                                                onChange={(e) => field.onChange(Number(e.target.value),)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="discount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Discount
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />

                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tax"
                                render={({ field }) => (
                                    <FormItem>

                                        <FormLabel>
                                            Tax
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0}
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>

                                        <FormMessage />

                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="finalAmount"
                                render={({ field }) => (
                                    <FormItem>

                                        <FormLabel>
                                            Final Amount
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                type="number"
                                                readOnly
                                                className="bg-muted"
                                                value={field.value}
                                            />
                                        </FormControl>

                                        <FormMessage />

                                    </FormItem>
                                )}
                            />

                        </div>


                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>

                                    <FormLabel>
                                        Status
                                    </FormLabel>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >

                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>


                                        <SelectContent>

                                            <SelectItem value="TRIAL">
                                                Trial
                                            </SelectItem>

                                            <SelectItem value="ACTIVE">
                                                Active
                                            </SelectItem>

                                            <SelectItem value="EXPIRED">
                                                Expired
                                            </SelectItem>

                                            <SelectItem value="CANCELLED">
                                                Cancelled
                                            </SelectItem>

                                        </SelectContent>

                                    </Select>

                                    <FormMessage />

                                </FormItem>
                            )}
                        />


                        <div className="flex justify-end gap-2 border-t pt-6">

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    onOpenChange(false)
                                }
                            >
                                Cancel
                            </Button>


                            <Button
                                type="submit"
                                disabled={
                                    createMutation.isPending ||
                                    updateMutation.isPending
                                }
                            >
                                {
                                    createMutation.isPending ||
                                        updateMutation.isPending
                                        ? "Saving..."
                                        : subscription
                                            ? "Update Subscription"
                                            : "Create Subscription"
                                }
                            </Button>

                        </div>


                    </form>

                </Form>


            </DialogContent>
        </Dialog>
    );
}
