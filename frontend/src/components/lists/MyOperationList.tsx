import OperationsTableView from "./OperationsTableView";

export default function MyOperationList() {
  return (
    <OperationsTableView
      title="Mis operaciones"
            endpoint="/api/operations/details/mine"
      emptyText="No tienes operaciones registradas."
    />
  );
}
