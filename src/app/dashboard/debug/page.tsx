'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, where, doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassData {
    id: string;
    name: string;
    teacherId: string;
    [key: string]: any;
}

interface TeacherStudentLink {
    studentId: string;
    teacherId: string;
    id: string;
}

export default function DebugPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const [allClasses, setAllClasses] = useState<ClassData[]>([]);
    const [myLinks, setMyLinks] = useState<TeacherStudentLink[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDebugData = async () => {
            if (!user || !firestore) return;
            setLoading(true);

            try {
                // 1. Fetch ALL classes (limit 50 for safety)
                const classesRef = collection(firestore, 'classes');
                const classesSnap = await getDocs(query(classesRef, limit(50)));
                const classes = classesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ClassData));
                setAllClasses(classes);

                // 2. Fetch YOUR teacher_student links
                const linksRef = collection(firestore, 'teacher_students');
                const linksQuery = query(linksRef, where('teacherId', '==', user.uid));
                const linksSnap = await getDocs(linksQuery);
                const links = linksSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as TeacherStudentLink));
                setMyLinks(links);

            } catch (error) {
                console.error("Debug fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDebugData();
    }, [user, firestore]);

    if (!user) return <div className="p-8">Please log in to use debug tools.</div>;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Debug Tools</h1>
                <Badge variant={loading ? "secondary" : "outline"}>
                    {loading ? "Refreshing..." : "Idle"}
                </Badge>
            </div>

            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Current User Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                        <span className="font-mono text-muted-foreground">UID:</span>
                        <code className="bg-muted px-2 py-0.5 rounded">{user.uid}</code>

                        <span className="font-mono text-muted-foreground">Email:</span>
                        <span className="font-medium">{user.email}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Classes Diagnostic */}
            <Card>
                <CardHeader>
                    <CardTitle>Classes (Raw Dump)</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Listing first 50 classes from Firestore. checking if 'teacherId' matches your UID.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b text-left">
                                    <th className="p-3 font-medium">Class Name</th>
                                    <th className="p-3 font-medium">Class (Doc) ID</th>
                                    <th className="p-3 font-medium">Assigned Teacher ID</th>
                                    <th className="p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allClasses.map((cls) => {
                                    const isMatch = cls.teacherId === user.uid;
                                    return (
                                        <tr key={cls.id} className="border-b last:border-0 hover:bg-muted/10">
                                            <td className="p-3 font-medium">{cls.name || "Untitled"}</td>
                                            <td className="p-3 font-mono text-xs text-muted-foreground">{cls.id}</td>
                                            <td className="p-3 font-mono text-xs">
                                                {cls.teacherId || <span className="text-red-500 font-bold">MISSING</span>}
                                            </td>
                                            <td className="p-3">
                                                {isMatch ? (
                                                    <Badge className="bg-green-500 hover:bg-green-600">You Own This</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Mismatch</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Class Link Analysis */}
            <ClassLinkAnalysis user={user} classes={allClasses.filter(c => c.teacherId === user.uid)} links={myLinks} />

            {/* Student Lookup Diagnostic */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Lookup & Link Check</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Search for a student to see why they might not be showing up.
                    </p>
                </CardHeader>
                <CardContent>
                    <StudentLookup userUid={user.uid} firestore={firestore} />
                </CardContent>
            </Card>

            {/* Links Diagnostic */}
            <Card>
                <CardHeader>
                    <CardTitle>Teacher-Student Links</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Found {myLinks.length} records in 'teacher_students' collection for your UID.
                    </p>
                </CardHeader>
                <CardContent>
                    {myLinks.length === 0 ? (
                        <div className="p-4 border rounded-md bg-yellow-50 text-yellow-900 border-yellow-200">
                            <strong>Warning:</strong> No student links found. This explains why no students appear, even if you own classes.
                        </div>
                    ) : (
                        <div className="max-h-60 overflow-y-auto rounded-md border text-xs">
                            <pre className="p-4">{JSON.stringify(myLinks, null, 2)}</pre>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}

function ClassLinkAnalysis({ user, classes, links }: { user: any, classes: ClassData[], links: TeacherStudentLink[] }) {
    const firestore = useFirestore();
    const [analysis, setAnalysis] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const runAnalysis = async () => {
        setLoading(true);
        const results = [];

        for (const cls of classes) {
            // 1. Get real students in this class
            const q = query(collection(firestore, 'students'), where('classId', '==', cls.id));
            const snap = await getDocs(q);
            const realStudentIds = snap.docs.map(d => d.id);

            // 2. Count how many are in our links
            const linkedCount = realStudentIds.filter(sid =>
                links.some(l => l.studentId === sid)
            ).length;

            results.push({
                name: cls.name,
                id: cls.id,
                total: realStudentIds.length,
                linked: linkedCount
            });
        }
        setAnalysis(results);
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Class Link Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">Check which classes are missing links.</p>
                </div>
                <button
                    onClick={runAnalysis}
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {loading ? "Analyzing..." : "Run Analysis"}
                </button>
            </CardHeader>
            <CardContent>
                {analysis.length > 0 && (
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b text-left">
                                    <th className="p-3 font-medium">Class Name</th>
                                    <th className="p-3 font-medium">Total Students (DB)</th>
                                    <th className="p-3 font-medium">Visible to You</th>
                                    <th className="p-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.map((row) => (
                                    <tr key={row.id} className="border-b last:border-0">
                                        <td className="p-3">{row.name}</td>
                                        <td className="p-3">{row.total}</td>
                                        <td className="p-3 font-bold">{row.linked}</td>
                                        <td className="p-3">
                                            {row.linked === row.total && row.total > 0 ? (
                                                <Badge className="bg-green-600">Ok</Badge>
                                            ) : row.linked === 0 && row.total > 0 ? (
                                                <Badge variant="destructive">Missing All Links</Badge>
                                            ) : row.total === 0 ? (
                                                <Badge variant="outline">Empty Class</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-500">Partial ({row.total - row.linked} missing)</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StudentLookup({ userUid, firestore }: { userUid: string, firestore: any }) {
    const [searchName, setSearchName] = useState("");
    const [result, setResult] = useState<any>(null);
    const [linkResult, setLinkResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCheck = async () => {
        if (!searchName.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);
        setLinkResult(null);

        try {
            // 1. Search for Student by name
            const studentsRef = collection(firestore, 'students');
            const qName = query(studentsRef, where('name', '==', searchName.trim()));
            const snapName = await getDocs(qName);

            if (snapName.empty) {
                setError("Student not found with that name");
                return;
            }

            const studentDoc = snapName.docs[0];
            const studentData = { id: studentDoc.id, ...studentDoc.data() };
            setResult(studentData);

            // 2. Check Link
            const linksRef = collection(firestore, 'teacher_students');
            const q = query(
                linksRef,
                where('teacherId', '==', userUid),
                where('studentId', '==', studentDoc.id)
            );
            const linkSnap = await getDocs(q);

            if (!linkSnap.empty) {
                setLinkResult({ found: true, id: linkSnap.docs[0].id, data: linkSnap.docs[0].data() });
            } else {
                setLinkResult({ found: false });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
                    placeholder="Enter Student Name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />
                <button
                    onClick={handleCheck}
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {loading ? "Checking..." : "Check"}
                </button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {result && (
                <div className="p-4 border rounded bg-muted/20 text-sm space-y-2">
                    <h4 className="font-semibold">Student Data</h4>
                    <pre className="text-xs bg-background p-2 rounded border overflow-x-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>

                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold">Link Status</h4>
                        {linkResult?.found ? (
                            <div className="text-green-600 font-medium flex items-center gap-2">
                                <span>✓</span>
                                Linked (Link ID: {linkResult.id})
                            </div>
                        ) : (
                            <div className="text-red-600 font-medium flex items-center gap-2">
                                <span>✕</span>
                                Not Linked
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
