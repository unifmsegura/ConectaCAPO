// src/views/MuralAdminView.tsx
import React, { useEffect, useRef, useState } from "react";
import { fetchAdminPosts, createPost, deletePost, AdminPost } from "../data/admin";

const MAX_FILE_MB = 5;

export function MuralAdminView() {
    const [posts, setPosts] = useState<AdminPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Formulário
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await fetchAdminPosts();
                if (!cancelled) {
                    setPosts(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar o mural.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFormError(null);
        if (f && f.size > MAX_FILE_MB * 1024 * 1024) {
            setFormError(`A foto deve ter no máximo ${MAX_FILE_MB} MB.`);
            e.target.value = "";
            setFile(null);
            setFileName(null);
            return;
        }
        setFile(f);
        setFileName(f ? f.name : null);
    }

    async function handlePublish() {
        if (!title.trim()) {
            setFormError("Informe o título da publicação.");
            return;
        }
        setFormError(null);
        setPublishing(true);
        try {
            await createPost(title.trim(), body.trim(), file);
            setTitle("");
            setBody("");
            setFile(null);
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setPosts(await fetchAdminPosts());
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Erro ao publicar no mural.");
        } finally {
            setPublishing(false);
        }
    }

    async function handleRemove(post: AdminPost) {
        if (!window.confirm(`Remover a publicação "${post.title}"? A foto também será apagada.`)) return;
        setRemovingId(post.id);
        setError(null);
        try {
            await deletePost(post);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao remover a publicação.");
        } finally {
            setRemovingId(null);
        }
    }

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Mural de Impacto</h1>
                <p className="text-sm text-gray-500">Publique novidades e fotos para as doadoras no app.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
            )}

            {/* Formulário de Nova Publicação */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">Nova Publicação</h3>
                <div>
                    <label htmlFor="mural-title" className="block text-xs font-bold text-gray-600 uppercase mb-1">Título</label>
                    <input
                        id="mural-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex.: Oficina de Lenços desta semana"
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                </div>
                <div>
                    <label htmlFor="mural-body" className="block text-xs font-bold text-gray-600 uppercase mb-1">Texto</label>
                    <textarea
                        id="mural-body"
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Conte o que aconteceu e agradeça as doadoras..."
                        className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                    />
                </div>
                <div>
                    <label htmlFor="mural-photo" className="block text-xs font-bold text-gray-600 uppercase mb-1">
                        Foto (opcional, até {MAX_FILE_MB} MB)
                    </label>
                    <input
                        id="mural-photo"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-sky-50 file:text-brand file:font-bold file:cursor-pointer"
                    />
                    {fileName && <p className="mt-1 text-xs text-gray-500">Selecionada: {fileName}</p>}
                </div>

                {formError && <p className="text-xs font-semibold text-red-600">{formError}</p>}

                <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-60"
                >
                    {publishing ? "Publicando..." : "Publicar no Mural"}
                </button>
            </div>

            {/* Lista de Publicações */}
            {loading ? (
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-500">Carregando publicações...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                    <p className="text-sm text-gray-500">Ainda não há publicações no mural.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((p) => (
                        <article key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex">
                            {p.imageUrl && (
                                <img src={p.imageUrl} alt={p.title} className="w-28 h-28 object-cover flex-shrink-0" />
                            )}
                            <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 truncate">{p.title}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{p.body}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">{p.createdAt}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(p)}
                                    disabled={removingId === p.id}
                                    className="self-start mt-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 disabled:opacity-60"
                                >
                                    {removingId === p.id ? "Removendo..." : "Remover"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
