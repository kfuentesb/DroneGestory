import OperationsTableView from "./OperationsTableView";

export default function MyOperationList() {
  return (
    <OperationsTableView
      title="Mis operaciones"
      endpoint="/api/auth/operations/details/mine"
      emptyText="No tienes operaciones registradas."
    />
  );
}
