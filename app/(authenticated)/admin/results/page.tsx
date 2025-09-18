"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  EyeOff,
  Bell,
  Download
} from "lucide-react";
import { 
  getResultsPublicationDeadline, 
  publishResults,
  getShortlistedApplicantsForExport,
  getAcceptedApplicantsForExport,
  getPendingApplicantsForExport
} from "@/lib/supabase/data-fetching";
import { format } from "date-fns";

export default function AdminResultsPage() {
  const [resultsDeadline, setResultsDeadline] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExportingShortlisted, setIsExportingShortlisted] = useState(false);
  const [isExportingAccepted, setIsExportingAccepted] = useState(false);
  const [isExportingPending, setIsExportingPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchResultsDeadline();
  }, []);

  const fetchResultsDeadline = async () => {
    try {
      const deadline = await getResultsPublicationDeadline();
      setResultsDeadline(deadline);
    } catch (error) {
      console.error('Error fetching results deadline:', error);
      setMessage({ type: 'error', text: 'Failed to fetch results deadline' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishResults = async () => {
    setIsPublishing(true);
    setMessage(null);
    
    try {
      await publishResults();
             setMessage({ type: 'success', text: 'Results have been published successfully! Applicants can now see their acceptance/selection status.' });
      await fetchResultsDeadline(); 
    } catch (error) {
      console.error('Error publishing results:', error);
      setMessage({ type: 'error', text: 'Failed to publish results. Please try again.' });
    } finally {
      setIsPublishing(false);
    }
  };

  const isResultsPublished = () => {
    if (!resultsDeadline) return false;
    const now = new Date();
    return now >= resultsDeadline;
  };

  const formatDeadline = (date: Date | null) => {
    if (!date) return "Not set";
    return format(date, "PPP 'at' p");
  };

  const exportShortlistedApplicants = async () => {
    setIsExportingShortlisted(true);
    setMessage(null);
    
    try {
      const applications = await getShortlistedApplicantsForExport();
      
      
      const csvRows: string[][] = [];
      
      applications.forEach((app: any) => {
        
        if (app.first_pref_status === 'shortlisted') {
          csvRows.push([
            app.name || '',
            app.email || '',
            app.register_no || '', 
            app.first_pref_dept?.name || 'Unknown Department',
            'First Preference'
          ]);
        }
        
        
        if (app.second_pref_status === 'shortlisted') {
          csvRows.push([
            app.name || '',
            app.email || '',
            app.register_no || '', 
            app.second_pref_dept?.name || 'Unknown Department',
            'Second Preference'
          ]);
        }
      });

      
      const headers = ['Name', 'Email', 'Phone Number', 'Department', 'Preference'];
      const csvContent = [headers, ...csvRows]
        .map(row => row.map((cell: string) => `"${cell}"`).join(','))
        .join('\n');

      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shortlisted_applicants_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
             setMessage({ type: 'success', text: 'Shortlisted applicants CSV exported successfully!' });
     } catch (error) {
       console.error('Error exporting shortlisted applicants:', error);
       setMessage({ type: 'error', text: 'Failed to export shortlisted applicants. Please try again.' });
     } finally {
       setIsExportingShortlisted(false);
     }
   };

   const exportAcceptedApplicants = async () => {
     setIsExportingAccepted(true);
     setMessage(null);
     
     try {
       const applications = await getAcceptedApplicantsForExport();
       
       
       const csvRows: string[][] = [];
       
       applications.forEach((app: any) => {
         
         if (app.first_pref_status === 'accepted') {
           csvRows.push([
             app.name || '',
             app.email || '',
             app.register_no || '', 
             app.first_pref_dept?.name || 'Unknown Department',
             'First Preference'
           ]);
         }
         
         
         if (app.second_pref_status === 'accepted') {
           csvRows.push([
             app.name || '',
             app.email || '',
             app.register_no || '', 
             app.second_pref_dept?.name || 'Unknown Department',
             'Second Preference'
           ]);
         }
       });

       
       const headers = ['Name', 'Email', 'Phone Number', 'Department', 'Preference'];
       const csvContent = [headers, ...csvRows]
         .map(row => row.map((cell: string) => `"${cell}"`).join(','))
         .join('\n');

       
       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
       const link = document.createElement('a');
       const url = URL.createObjectURL(blob);
       link.setAttribute('href', url);
       link.setAttribute('download', `accepted_applicants_${new Date().toISOString().split('T')[0]}.csv`);
       link.style.visibility = 'hidden';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       setMessage({ type: 'success', text: 'Accepted applicants CSV exported successfully!' });
     } catch (error) {
       console.error('Error exporting accepted applicants:', error);
       setMessage({ type: 'error', text: 'Failed to export accepted applicants. Please try again.' });
     } finally {
       setIsExportingAccepted(false);
     }
   };

   const exportPendingApplicants = async () => {
     setIsExportingPending(true);
     setMessage(null);
     
     try {
       const applications = await getPendingApplicantsForExport();
       
       
       const csvRows: string[][] = [];
       
       applications.forEach((app: any) => {
         
         if (app.first_pref_status === 'pending') {
           csvRows.push([
             app.name || '',
             app.email || '',
             app.register_no || '', 
             app.first_pref_dept?.name || 'Unknown Department',
             'First Preference'
           ]);
         }
         
         
         if (app.second_pref_status === 'pending') {
           csvRows.push([
             app.name || '',
             app.email || '',
             app.register_no || '', 
             app.second_pref_dept?.name || 'Unknown Department',
             'Second Preference'
           ]);
         }
       });

       
       const headers = ['Name', 'Email', 'Phone Number', 'Department', 'Preference'];
       const csvContent = [headers, ...csvRows]
         .map(row => row.map((cell: string) => `"${cell}"`).join(','))
         .join('\n');

       
       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
       const link = document.createElement('a');
       const url = URL.createObjectURL(blob);
       link.setAttribute('href', url);
       link.setAttribute('download', `pending_applicants_${new Date().toISOString().split('T')[0]}.csv`);
       link.style.visibility = 'hidden';
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
       setMessage({ type: 'success', text: 'Pending applicants CSV exported successfully!' });
     } catch (error) {
       console.error('Error exporting pending applicants:', error);
       setMessage({ type: 'error', text: 'Failed to export pending applicants. Please try again.' });
     } finally {
       setIsExportingPending(false);
     }
   };

  if (isLoading) {
    return (
      <div className="min-h-screen hackclub-bg p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hackclub-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Results Publication Management
          </h1>
          <p className="text-gray-300">
            Control when applicants can see their acceptance/rejection status
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                {message.text}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Main Card */}
        <Card className="hackclub-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  Results Publication Status
                </CardTitle>
                <CardDescription>
                  Manage when applicants can view their final results
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isResultsPublished() ? (
                  <Badge className="bg-green-500/90 text-white">
                    <Eye className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/90 text-white">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-white">Publication Deadline</span>
                </div>
                <p className="text-sm text-gray-300">
                  {formatDeadline(resultsDeadline)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-white">Current Status</span>
                </div>
                <p className="text-sm text-gray-300">
                  {isResultsPublished() 
                    ? "Results are visible to applicants" 
                    : "Results are hidden from applicants"
                  }
                </p>
              </div>
            </div>

                         {/* Export Section */}
             <div className="border-t border-gray-700 pt-6">
               <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                 <Card className="bg-gray-800/50 border-gray-700">
                   <CardContent className="p-4">
                     <div className="text-center space-y-3">
                       <div className="p-2 bg-blue-500/20 rounded-lg w-fit mx-auto">
                         <Download className="h-6 w-6 text-blue-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-white mb-1">Shortlisted Applicants</h4>
                         <p className="text-sm text-gray-300">Export CSV with name, email, phone, department, and preference</p>
                       </div>
                       <Button
                         onClick={exportShortlistedApplicants}
                         disabled={isExportingShortlisted}
                         variant="outline"
                         className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                       >
                         {isExportingShortlisted ? (
                           <div className="flex items-center gap-2">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                             Exporting...
                           </div>
                         ) : (
                           <div className="flex items-center gap-2">
                             <Download className="h-4 w-4" />
                             Export Shortlisted
                           </div>
                         )}
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
                 
                 <Card className="bg-gray-800/50 border-gray-700">
                   <CardContent className="p-4">
                     <div className="text-center space-y-3">
                       <div className="p-2 bg-green-500/20 rounded-lg w-fit mx-auto">
                         <Download className="h-6 w-6 text-green-400" />
                       </div>
                                               <div>
                          <h4 className="font-medium text-white mb-1">Accepted Applicants</h4>
                          <p className="text-sm text-gray-300">Export CSV with final accepted applicants</p>
                        </div>
                        <Button
                          onClick={exportAcceptedApplicants}
                          disabled={isExportingAccepted}
                          variant="outline"
                          className="w-full border-green-500 text-green-400 hover:bg-green-500/10"
                        >
                          {isExportingAccepted ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                              Exporting...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              Export Accepted
                            </div>
                          )}
                        </Button>
                     </div>
                   </CardContent>
                 </Card>
                 
                 <Card className="bg-gray-800/50 border-gray-700">
                   <CardContent className="p-4">
                     <div className="text-center space-y-3">
                       <div className="p-2 bg-yellow-500/20 rounded-lg w-fit mx-auto">
                         <Download className="h-6 w-6 text-yellow-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-white mb-1">Pending Applicants</h4>
                         <p className="text-sm text-gray-300">Export CSV with all pending applications</p>
                       </div>
                       <Button
                         onClick={exportPendingApplicants}
                         disabled={isExportingPending}
                         variant="outline"
                         className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                       >
                         {isExportingPending ? (
                           <div className="flex items-center gap-2">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                             Exporting...
                           </div>
                         ) : (
                           <div className="flex items-center gap-2">
                             <Download className="h-4 w-4" />
                             Export Pending
                           </div>
                         )}
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </div>

             {/* Action Section */}
             <div className="border-t border-gray-700 pt-6">
               <div className="text-center space-y-4">
                {!isResultsPublished() ? (
                  <>
                    <div className="text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Results Currently Hidden</span>
                      </div>
                      <p className="text-sm text-amber-300">
                                                 Applicants cannot see their acceptance/selection status until you publish the results.
                      </p>
                    </div>
                    
                    {/* <Button
                      onClick={handlePublishResults}
                      disabled={isPublishing}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    >
                      {isPublishing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Publishing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          Publish Results Now
                        </div>
                      )}
                    </Button> */}
                  </>
                ) : (
                  <div className="text-green-400 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Results Published</span>
                    </div>
                    <p className="text-sm text-green-300">
                                             Results have been published. Applicants can now see their acceptance/selection status.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Information Section */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">How it works</h3>
              <div className="space-y-3 text-sm text-gray-300">
                                 <div className="flex items-start gap-3">
                   <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                   <p>Before publication: Applicants see their shortlisting round status (shortlisted, etc.)</p>
                 </div>
                                   <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p>After publication: Applicants see their final results (accepted/rejected)</p>
                  </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Once published, results cannot be hidden again</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>This gives you control over when applicants learn their final outcome</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 