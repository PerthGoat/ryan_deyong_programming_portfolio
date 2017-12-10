use strict;
use warnings;
use v5;

use feature 'say';

# the path of the folder that holds the templates
my $base_folder_path = 'canned/';

# templating engine, makes dynamic loading of repeated code fastesr
# takes a string, returns a string + whatever needs to be loaded
sub template_engine {
    my $str = shift;
    
    while(1) {
        my ($result) = ($str =~ /%%(.*?)%%/);
        if(not defined $result) { # if result is empty, we are done templating
            return $str;
        }
        my $path = $base_folder_path . $result;
        if(-e $path) { # if the file exists
            local $/ = undef; # read entire file
            open my $fh, '<', $path or die "Can't open file!";
            my $document = <$fh>;
            close $fh;
            $str =~ s/%%(.*?)%%/$document/;
        } else {
            say "Tried to load $path, doesn't exist!";
        }
    }
}

say template_engine "junk asdfafa %%header.html%% test %%header1.html%%";