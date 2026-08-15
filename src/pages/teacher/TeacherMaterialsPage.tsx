import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  FileText,
  File,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
  Presentation,
  Globe,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataStore } from '../../lib/dataProvider';
import { LearningMaterial, MaterialType, Class, Subject } from '../../types';
import { uploadFile, formatBytes, downloadFile, validateFile } from '../../services/storageService';
import { getMaterialTypeMeta } from '../../services/learningService';
import { FileViewerModal } from '../../components/learning/FileViewerModal';

export const TeacherMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter States
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<LearningMaterial | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    class_id: '',
    subject_id: '',
    material_type: 'pdf' as MaterialType,
    external_url: '',
    content_text: '',
    is_published: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  const teacher = user ? dataStore.getTeacherByProfileId(user.id) : undefined;

  const loadData = () => {
    const teacherId = teacher?.id;
    const allMaterials = dataStore.getLearningMaterials({
      teacherId: teacherId,
      classId: selectedClass !== 'all' ? selectedClass : undefined,
      subjectId: selectedSubject !== 'all' ? selectedSubject : undefined,
      search: searchQuery || undefined,
    });

    let filtered = allMaterials;
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.material_type === selectedType);
    }

    setMaterials(filtered);
    setClasses(dataStore.getClasses());
    setSubjects(dataStore.getSubjects());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.subscribe(loadData);
    return () => unsubscribe();
  }, [selectedClass, selectedSubject, selectedType, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setFormData({
      title: '',
      description: '',
      topic: '',
      class_id: classes[0]?.id || '',
      subject_id: subjects[0]?.id || '',
      material_type: 'pdf',
      external_url: '',
      content_text: '',
      is_published: true,
    });
    setSelectedFile(null);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (mat: LearningMaterial) => {
    setEditingMaterial(mat);
    setFormData({
      title: mat.title,
      description: mat.description,
      topic: mat.topic,
      class_id: mat.class_id,
      subject_id: mat.subject_id,
      material_type: mat.material_type,
      external_url: mat.external_url || '',
      content_text: mat.content_text || '',
      is_published: mat.is_published,
    });
    setSelectedFile(null);
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please enter a material title.');
      return;
    }
    if (!formData.class_id) {
      setFormError('Please select a target class.');
      return;
    }
    if (!formData.subject_id) {
      setFormError('Please select a subject.');
      return;
    }
    if (!formData.topic.trim()) {
      setFormError('Please provide a topic or unit name.');
      return;
    }

    if (
      (formData.material_type === 'pdf' ||
        formData.material_type === 'presentation' ||
        formData.material_type === 'document' ||
        formData.material_type === 'image') &&
      !selectedFile &&
      !editingMaterial?.file_url
    ) {
      setFormError('Please select a document or file to upload.');
      return;
    }

    if (formData.material_type === 'link' || formData.material_type === 'video') {
      if (!formData.external_url.trim()) {
        setFormError('Please provide a valid web or video URL.');
        return;
      }
    }

    if (formData.material_type === 'note' && !formData.content_text.trim()) {
      setFormError('Please enter the text content for the notes.');
      return;
    }

    try {
      setIsUploading(true);

      let filePath = editingMaterial?.file_path;
      let fileUrl = editingMaterial?.file_url;
      let fileName = editingMaterial?.file_name;
      let fileSize = editingMaterial?.file_size;
      let mimeType = editingMaterial?.mime_type;

      if (selectedFile) {
        const uploadResult = await uploadFile(
          'notes',
          selectedFile,
          `class_${formData.class_id}`
        );
        filePath = uploadResult.filePath;
        fileUrl = uploadResult.fileUrl;
        fileName = uploadResult.fileName;
        fileSize = uploadResult.fileSize;
        mimeType = uploadResult.mimeType;
      }

      if (editingMaterial) {
        dataStore.updateLearningMaterial(
          editingMaterial.id,
          {
            ...formData,
            file_path: filePath,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
          },
          user ? { id: user.id, name: user.full_name, role: user.role } : undefined
        );
        setSuccessToast('Material updated successfully!');
      } else {
        dataStore.createLearningMaterial(
          {
            ...formData,
            teacher_id: teacher?.id || 'teach-1',
            file_path: filePath,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            mime_type: mimeType,
          },
          user ? { id: user.id, name: user.full_name, role: user.role } : undefined
        );
        setSuccessToast('New study material published successfully!');
      }

      setIsUploading(false);
      setIsCreateModalOpen(false);
      loadData();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setFormError(err.message || 'Failed to save material. Please verify file and inputs.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dataStore.deleteLearningMaterial(
        id,
        user ? { id: user.id, name: user.full_name, role: user.role } : undefined
      );
      setSuccessToast('Material deleted.');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleTogglePublish = (mat: LearningMaterial) => {
    dataStore.updateLearningMaterial(
      mat.id,
      { is_published: !mat.is_published },
      user ? { id: user.id, name: user.full_name, role: user.role } : undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes & Study Material Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload lecture notes, presentation slides, PDF guides, and interactive resources for your classes.
          </p>
        </div>

        <button
          id="btn-add-material"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study Material</span>
        </button>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-2xl border border-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search title, topic, or file..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Class: {c.name}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Material Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Material Formats</option>
            <option value="pdf">PDF Documents</option>
            <option value="presentation">Presentations (PPTX)</option>
            <option value="document">Word Documents</option>
            <option value="image">Diagrams / Images</option>
            <option value="note">Text Lecture Notes</option>
            <option value="link">Web Resources / Links</option>
            <option value="video">Video Links</option>
          </select>
        </div>
      </div>

      {/* Material Cards Grid */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {materials.map(mat => {
            const meta = getMaterialTypeMeta(mat.material_type);
            return (
              <div
                key={mat.id}
                className="group relative p-5 bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Subject Badge + Published Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 truncate">
                      {mat.subject?.code} • {mat.class?.name}
                    </span>
                    <button
                      onClick={() => handleTogglePublish(mat)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        mat.is_published
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {mat.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  {/* Title & Topic */}
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {mat.title}
                  </h3>
                  <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{mat.topic}</span>
                  </p>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {mat.description}
                  </p>

                  {/* Material Format Pill */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.text}`}>
                      {mat.material_type === 'pdf' ? <FileText className="w-3.5 h-3.5" /> : mat.material_type === 'presentation' ? <Presentation className="w-3.5 h-3.5" /> : mat.material_type === 'link' ? <LinkIcon className="w-3.5 h-3.5" /> : mat.material_type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      <span>{meta.label}</span>
                    </span>
                    {mat.file_size ? (
                      <span className="text-[11px] text-muted-foreground font-mono">{formatBytes(mat.file_size)}</span>
                    ) : null}
                  </div>
                </div>

                {/* Footer Actions & Metadata */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Total Views">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{mat.view_count || 0}</span>
                    </span>
                    <span>{new Date(mat.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingMaterial(mat)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Preview & View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {mat.file_url && (
                      <button
                        onClick={() => downloadFile(mat.file_url!, mat.file_name || 'document')}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    {mat.external_url && (
                      <a
                        href={mat.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Open Resource Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(mat)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Edit Material"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id, mat.title)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-2xl border border-border flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground">No Study Material Found</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Upload course notes, slides, documents, or link external learning resources for students.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Material</span>
          </button>
        </div>
      )}

      {/* Create / Edit Material Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-base font-bold text-foreground">
                {editingMaterial ? 'Edit Study Material' : 'Upload Notes & Study Material'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Material Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Supervised Learning & Support Vector Machines"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Class & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Target Class *</label>
                  <select
                    value={formData.class_id}
                    onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subject *</label>
                  <select
                    value={formData.subject_id}
                    onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic / Unit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Topic / Unit / Chapter *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 - Support Vector Machines & Optimization"
                  value={formData.topic}
                  onChange={e => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Format / Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Material Format</label>
                <select
                  value={formData.material_type}
                  onChange={e => setFormData({ ...formData, material_type: e.target.value as MaterialType })}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="pdf">PDF Document (*.pdf)</option>
                  <option value="presentation">Presentation Slides (*.pptx, *.ppt)</option>
                  <option value="document">Word Document (*.docx, *.doc)</option>
                  <option value="image">Diagram / Image (*.png, *.jpg)</option>
                  <option value="note">Text-Based Lecture Notes</option>
                  <option value="link">Web Resource / Sandbox Link</option>
                  <option value="video">Video Lecture Link</option>
                </select>
              </div>

              {/* File Upload zone if file format */}
              {(formData.material_type === 'pdf' ||
                formData.material_type === 'presentation' ||
                formData.material_type === 'document' ||
                formData.material_type === 'image') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Upload File (Max 15MB)</span>
                    {editingMaterial?.file_name && (
                      <span className="text-[11px] text-muted-foreground font-normal">
                        Current: {editingMaterial.file_name}
                      </span>
                    )}
                  </label>
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer bg-background hover:bg-muted/30 transition-colors">
                    <input
                      type="file"
                      id="input-material-file"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                        }
                      }}
                      className="w-full text-xs text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* External URL if Link or Video */}
              {(formData.material_type === 'link' || formData.material_type === 'video') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">External Resource / Video URL *</label>
                  <input
                    type="url"
                    placeholder="https://playground.tensorflow.org or https://youtube.com/watch?..."
                    value={formData.external_url}
                    onChange={e => setFormData({ ...formData, external_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              )}

              {/* Text Note Editor */}
              {formData.material_type === 'note' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Lecture Notes Text *</label>
                  <textarea
                    rows={6}
                    placeholder="Write detailed notes, formulas, code snippets or revision guides..."
                    value={formData.content_text}
                    onChange={e => setFormData({ ...formData, content_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Material Overview / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Provide a brief summary for students to understand what this material covers..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <input
                  type="checkbox"
                  id="chk-publish"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary"
                />
                <label htmlFor="chk-publish" className="text-xs font-semibold text-foreground cursor-pointer">
                  Publish immediately (Students in this class will receive instant notifications)
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : editingMaterial ? 'Save Changes' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File & Note Viewer Modal */}
      {viewingMaterial && (
        <FileViewerModal
          isOpen={!!viewingMaterial}
          onClose={() => setViewingMaterial(null)}
          title={viewingMaterial.title}
          fileUrl={viewingMaterial.file_url}
          fileName={viewingMaterial.file_name}
          fileSize={viewingMaterial.file_size}
          mimeType={viewingMaterial.mime_type}
          contentText={viewingMaterial.content_text}
          externalUrl={viewingMaterial.external_url}
          authorName={viewingMaterial.teacher?.profile?.full_name}
          date={viewingMaterial.created_at}
        />
      )}
    </div>
  );
};
