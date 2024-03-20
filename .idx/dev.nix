{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs
  ];
  idx.extensions = [
    "angular.ng-template"
  ];
  idx.previews = {
    previews = [
      {
        command = [
          "npm"
          "run"
          "watch:shell"
        ];
        manager = "web";
        id = "web";
      }
    ];
  };
}