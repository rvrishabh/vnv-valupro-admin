import { branchesApi } from "@/api/branches.api";
import { institutionsApi } from "@/api/institutions.api";
import { AlertPopup } from "@/components/AlertPopup/AlertPopup";
import { DataTable } from "@/components/DataTable/data-table";
import { DataTableColumnHeader } from "@/components/DataTable/data-table-column-header";
import FormInput from "@/components/Form/FormInput";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api-client";
import type { Branch } from "@/types/branch.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/branches/")({
  component: BranchesPage,
});

const formSchema = z.object({
  institutionId: z.string().min(1, "Institution is required"),
  branchName: z.string().min(1, "Branch name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function buildSort(sorting: SortingState): string | undefined {
  const [first] = sorting;
  if (!first) return undefined;
  return `${first.id}:${first.desc ? "desc" : "asc"}`;
}

function BranchesPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"all" | "queue">("all");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchText, setSearchText] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);

  const institutionsQuery = useQuery({
    queryKey: ["institutions", "all"],
    queryFn: () => institutionsApi.list({ page: 1, limit: 200 }),
  });

  const listQuery = useQuery({
    queryKey: ["branches", pagination, sorting, searchText],
    queryFn: () =>
      branchesApi.list({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: buildSort(sorting),
        search: searchText,
      }),
    enabled: view === "all",
  });

  const queueQuery = useQuery({
    queryKey: ["branches", "verification-queue"],
    queryFn: () => branchesApi.verificationQueue(),
    enabled: view === "queue",
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institutionId: "",
      branchName: "",
      city: "",
      state: "",
      district: "",
      address: "",
    },
  });

  const openCreate = () => {
    form.reset({
      institutionId: "",
      branchName: "",
      city: "",
      state: "",
      district: "",
      address: "",
    });
    setModalOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => branchesApi.createManual(values),
    onSuccess: () => {
      toast.success("Branch created");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => branchesApi.verify(id),
    onSuccess: () => {
      toast.success("Branch verified");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to verify");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => branchesApi.reject(id),
    onSuccess: () => {
      toast.success("Branch rejected");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Unable to reject");
    },
  });

  const baseColumns = useMemo<ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: "branchName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Branch" />
        ),
      },
      {
        id: "institution",
        header: "Institution",
        cell: ({ row }) => row.original.institution?.name ?? "—",
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="City" />
        ),
      },
      {
        accessorKey: "state",
        header: "State",
      },
      {
        accessorKey: "ifscCode",
        header: "IFSC",
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {row.original.ifscCode || "—"}
          </span>
        ),
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => (
          <Badge variant={row.original.isManuallyEntered ? "outline" : "secondary"}>
            {row.original.isManuallyEntered ? "Manual" : "IFSC Lookup"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const allColumns = useMemo<ColumnDef<Branch>[]>(
    () => [
      ...baseColumns,
      {
        id: "verification",
        header: "Verification",
        cell: ({ row }) =>
          row.original.needsVerification ? (
            <Badge variant="destructive">Pending</Badge>
          ) : (
            <Badge variant="default">Verified</Badge>
          ),
      },
    ],
    [baseColumns],
  );

  const queueColumns = useMemo<ColumnDef<Branch>[]>(
    () => [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-primary"
              onClick={(e) => {
                e.stopPropagation();
                verifyMutation.mutate(row.original.id);
              }}
            >
              <IconCheck className="h-4 w-4" />
              Verify
            </Button>
            <AlertPopup
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconX className="h-4 w-4" />
                  Reject
                </Button>
              }
              title="Reject branch?"
              cancelAction="Cancel"
              continueAction={
                <span onClick={() => rejectMutation.mutate(row.original.id)}>
                  Reject
                </span>
              }
            >
              This will remove "{row.original.branchName}" from the platform.
            </AlertPopup>
          </div>
        ),
      },
    ],
    [baseColumns, verifyMutation, rejectMutation],
  );

  const institutionOptions = institutionsQuery.data?.data ?? [];
  const queueData = queueQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Branches
          </h2>
          <p className="text-sm text-muted-foreground">
            Institution branches, IFSC lookups, and manual verification queue.
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="h-4 w-4" />
          New Branch
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "all" | "queue")}>
        <TabsList>
          <TabsTrigger value="all">All Branches</TabsTrigger>
          <TabsTrigger value="queue">
            Verification Queue
            {queueData.length > 0 && (
              <Badge variant="destructive" className="ml-1.5">
                {queueData.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "all" ? (
        <DataTable
          columns={allColumns}
          data={listQuery.data?.data ?? []}
          isLoading={listQuery.isLoading}
          toolbar
          searchText={searchText}
          setSearchText={setSearchText}
          pagination={pagination}
          setPagination={setPagination}
          sorting={sorting}
          setSorting={setSorting}
          pageCount={listQuery.data?.totalPages ?? 0}
        />
      ) : (
        <DataTable
          columns={queueColumns}
          data={queueData}
          isLoading={queueQuery.isLoading}
        />
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title="New Branch">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-2 pb-2"
          >
            <FormField
              control={form.control}
              name="institutionId"
              render={({ field }) => (
                <FormItem className="w-full pb-2">
                  <FormLabel>Institution</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an institution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutionOptions.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormInput
              control={form.control}
              name="branchName"
              label="Branch Name"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <FormInput control={form.control} name="city" label="City" required />
              <FormInput control={form.control} name="state" label="State" required />
            </div>
            <FormInput control={form.control} name="district" label="District" />
            <FormInput control={form.control} name="address" label="Address" />
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating…" : "Create Branch"}
            </Button>
          </form>
        </Form>
      </Modal>
    </div>
  );
}
