import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  CalendarCheck,
  GraduationCap,
  Mail,
  UserRound,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ClipboardList,
  ChevronRight,
  Plus,
} from "lucide-react";

import {
  studentApi,
  getErrorMessage,
  unwrapStudents,
  unwrapStudent,
} from "./api";

const today = new Date().toISOString().slice(0, 10);

function initials(student) {
  const name = student?.name || student?.fullName || "Student";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}
function studentName(student) {
  return (
    student?.name ||
    student?.fullName ||
    student?.studentName ||
    "Unnamed student"
  );
}
function studentId(student) {
  return student?._id || student?.id || student?.studentId;
}
function prettyDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", email: "" });
  const [attendance, setAttendance] = useState({
    attendanceStatus: true,
    homeWork: true,
    date: today,
  });
  const [detailLoading, setDetailLoading] = useState(false);

  const notify = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentApi.all();
      setStudents(unwrapStudents(response.data));
    } catch (error) {
      notify("error", `Could not load students: ${getErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const q = search.trim().toLowerCase();
        return (
          !q ||
          studentName(s).toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q) ||
          String(studentId(s) || "")
            .toLowerCase()
            .includes(q)
        );
      }),
    [students, search],
  );

  async function addStudent(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const response = await studentApi.add({
        name: addForm.name.trim(),
        email: addForm.email.trim(),
      });
      notify("success", response.data?.message || "Student added successfully");
      setAddForm({ name: "", email: "" });
      setModal("");
      await loadStudents();
    } catch (error) {
      notify("error", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function openDetails(student) {
    setSelected(student);
    setModal("details");
    const id = studentId(student);
    if (!id) return;
    setDetailLoading(true);
    try {
      const response = await studentApi.one(id);
      setSelected(unwrapStudent(response.data));
    } catch (error) {
      notify(
        "error",
        `Could not load student details: ${getErrorMessage(error)}`,
      );
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveAttendance(e) {
    e.preventDefault();

    const id = studentId(selected);
    if (!id) return notify("error", "Student ID not found");

    setBusy(true);

    try {
      const response = await studentApi.updateAttendance(id, {
        attendance: attendance.attendanceStatus,
        homeWork: attendance.homeWork,
        date: attendance.date,
      });

      notify(
        "success",
        response.data?.message || "Attendance updated successfully",
      );

      setModal("");
      await loadStudents();
    } catch (error) {
      console.log("API ERROR:", error.response?.data);
      notify("error", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function deleteStudent(student) {
    const id = studentId(student);
    if (!id) return notify("error", "Student ID not found");
    if (
      !window.confirm(
        `Delete ${studentName(student)}? This action cannot be undone.`,
      )
    )
      return;
    try {
      const response = await studentApi.remove(id);
      notify(
        "success",
        response.data?.message || "Student deleted successfully",
      );
      await loadStudents();
    } catch (error) {
      notify("error", getErrorMessage(error));
    }
  }

  const presentCount = students.filter((s) => {
    const latestRecord = s.records?.length
      ? s.records[s.records.length - 1]
      : null;

    return (
      latestRecord?.attendance === true ||
      String(latestRecord?.attendance).toLowerCase() === "present"
    );
  }).length;

  const absentCount = students.filter((s) => {
    const latestRecord = s.records?.length
      ? s.records[s.records.length - 1]
      : null;

    return (
      latestRecord?.attendance === false ||
      String(latestRecord?.attendance).toLowerCase() === "absent"
    );
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/">
            {" "}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
                <GraduationCap size={23} />
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900">
                  Student<span className="text-indigo-600">Desk</span>
                </p>
                <p className="text-xs text-slate-500">
                  Student management dashboard
                </p>
              </div>
            </div>
          </Link>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            ● API connected UI
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold text-indigo-600">
              OVERVIEW
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Students
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage student records and attendance in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal("add")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <UserPlus size={18} />
            Add student
          </button>
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Users size={20} />}
            label="Total Students"
            value={students.length}
            tone="indigo"
          />

          <Stat
            icon={<CheckCircle2 size={20} />}
            label="Total Present"
            value={presentCount}
            tone="emerald"
          />

          <Stat
            icon={<AlertCircle size={20} />}
            label="Total Absent"
            value={absentCount}
            tone="amber"
          />
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-bold text-slate-900">All students</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Student records from your backend API
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email or ID"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
              <button
                onClick={loadStudents}
                className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
                title="Refresh"
              >
                <RefreshCw size={17} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <LoaderCircle className="animate-spin" size={19} /> Loading
              students...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Users size={22} />
              </div>
              <p className="font-semibold text-slate-800">
                {search ? "No matching students" : "No students found"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try another search term."
                  : "Add your first student to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Student</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Attendance</th>
                    <th className="px-5 py-3 font-semibold">HomeWork</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((s, i) => (
                    <tr
                      key={studentId(s) || i}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">
                            {initials(s)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {studentName(s)}
                            </p>
                            <p className="max-w-36 truncate text-xs text-slate-400">
                              {studentId(s) || "No ID"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {s.email || "—"}
                      </td>

                      {/* Latest Attendance Status */}
                      <td className="px-5 py-4">
                        <AttendanceBadge
                          status={
                            s.records?.length
                              ? s.records[s.records.length - 1].attendance
                              : null
                          }
                        />
                      </td>
                      {/* Latest Home Wark Status */}
                      <td className="px-5 py-4">
                        <HomeWorkBadge
                          status={
                            s.records?.length
                              ? s.records[s.records.length - 1].homeWork
                              : null
                          }
                        />
                      </td>

                      {/* Latest Attendance Date */}
                      <td className="px-5 py-4 text-slate-500">
                        {s.records?.length
                          ? prettyDate(s.records[s.records.length - 1].date)
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end items-center gap-2">
                          {/* View All Attendance & Homework History */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(s);
                              setModal("history");
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 transition"
                            title="View attendance history"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Mark / Update Attendance */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(s);

                              setAttendance({
                                attendanceStatus: true,
                                homeWork: false,
                                date: new Date().toLocaleDateString("en-CA"),
                              });

                              setModal("attendance");
                            }}
                            className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
                            title="Mark attendance"
                          >
                            <Plus size={20} />
                          </button>

                          {/* Delete Student */}
                          <button
                            type="button"
                            onClick={() => deleteStudent(s)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Delete student"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            <span>{filtered.length} record(s)</span>
            <span>Student Management</span>
          </div>
        </section>
        <p className="mt-4 text-center text-xs text-slate-400">
          Connected to{" "}
          {import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}
        </p>
      </main>

      {notice && (
        <div
          className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl ${notice.type === "success" ? "bg-emerald-600" : "bg-rose-600"}`}
        >
          <span>
            {notice.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
          </span>
          {notice.message}
        </div>
      )}

      {/* MODAL: ADD STUDENT */}

      {modal === "add" && (
        <Modal
          title="Add New Student"
          subtitle="Enter student information to create a new record."
          onClose={() => {
            setModal("");
            setAddForm({ name: "", email: "" });
          }}
        >
          <form onSubmit={addStudent} className="space-y-4">
            {/* Student Name */}
            <Field label="Student Name">
              <input
                type="text"
                required
                autoFocus
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    name: e.target.value,
                  })
                }
                placeholder="Enter student name"
                className={inputClass}
              />
            </Field>

            {/* Student Email */}
            <Field label="Student Email">
              <input
                type="email"
                required
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({
                    ...addForm,
                    email: e.target.value,
                  })
                }
                placeholder="student@example.com"
                className={inputClass}
              />
            </Field>

            {/* Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setModal("");
                  setAddForm({ name: "", email: "" });
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy || !addForm.name.trim() || !addForm.email.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL : STUDENT DETAILS*/}

      {modal === "details" && (
        <Modal
          title="Student Details"
          subtitle="Student information"
          onClose={() => setModal("")}
        >
          {detailLoading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading details...
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                  {initials(selected)}
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    {studentName(selected)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selected?.email || "No email"}
                  </p>
                </div>
              </div>

              <Detail label="Student ID" value={studentId(selected) || "—"} />
            </div>
          )}
        </Modal>
      )}

      {/* MODAL : MARK ATTENDANCE */}

      {modal === "attendance" && (
        <Modal
          title="Mark Attendance"
          subtitle={`Update attendance for ${studentName(selected)}.`}
          onClose={() => setModal("")}
        >
          <form onSubmit={saveAttendance} className="space-y-4">
            {/* Attendance Status */}
            <Field label="Attendance">
              <select
                value={String(attendance.attendanceStatus)}
                onChange={(e) =>
                  setAttendance({
                    ...attendance,
                    attendanceStatus: e.target.value === "true",
                  })
                }
                className={inputClass}
              >
                <option value="true">Present</option>
                <option value="false">Absent</option>
              </select>
            </Field>

            {/* Homework Status */}
            <Field label="Homework">
              <select
                value={String(attendance.homeWork)}
                onChange={(e) =>
                  setAttendance({
                    ...attendance,
                    homeWork: e.target.value === "true",
                  })
                }
                className={inputClass}
              >
                <option value="true">Completed</option>
                <option value="false">Not Completed</option>
              </select>
            </Field>

            {/* Select Attendance Date */}
            <Field label="Select Date">
              <input
                required
                type="date"
                value={attendance.date}
                onChange={(e) =>
                  setAttendance({
                    ...attendance,
                    date: e.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModal("")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {busy ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/*MODAL : ATTENDANCE HISTORY*/}

      {modal === "history" && (
        <Modal
          title="Attendance History"
          subtitle={`All records of ${studentName(selected)}`}
          onClose={() => setModal("")}
        >
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {selected?.records?.length > 0 ? (
              [...selected.records]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((record, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4 space-y-3"
                  >
                    {/* Record Date */}
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">
                        {prettyDate(record.date)}
                      </p>
                    </div>

                    {/* Attendance Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Attendance
                      </span>
                      <AttendanceBadge status={record.attendance} />
                    </div>
                    <div>
                      ------------------------------------------------------------------
                    </div>
                    {/* Homework Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Homework
                      </span>
                      <HomeWorkBadge status={record.homeWork} />
                    </div>
                  </div>
                ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-slate-500">No attendance history found.</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50";
function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {children}
    </label>
  );
}
function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[65%] break-all text-right font-medium text-slate-800">
        {value}
      </span>
    </div>
  );
}

function AttendanceBadge({ status }) {
  const raw =
    status === true ? "present" : status === false ? "absent" : status;

  const s = String(raw || "")
    .toLowerCase()
    .trim();

  const config = {
    present: {
      label: "Present",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    },
    absent: {
      label: "Absent",
      style: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    late: {
      label: "Late",
      style: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    },
    excused: {
      label: "Excused",
      style: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    "not marked": {
      label: "Not Marked",
      style: "bg-slate-50 text-slate-500 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  const key = s === "true" ? "present" : s === "false" ? "absent" : s;

  const item = config[key] || config["not marked"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm ${item.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function HomeWorkBadge({ status }) {
  const isDone = status === true;

  const item = isDone
    ? {
        label: "Yes",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      }
    : {
        label: "No",
        style: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${item.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function Stat({ icon, label, value, tone }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`rounded-xl p-2.5 ${styles[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default App;
